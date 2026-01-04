import React, { useState, useRef, useCallback } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { editImage } from '../services/geminiService';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ data: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

const ImageEditor: React.FC<ImageEditorProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<{ file: File, preview: string, payload: { data: string, mimeType: string } } | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please upload an image to edit.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please describe the edit you want to make.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const result = await editImage(imageFile.payload.data, imageFile.payload.mimeType, prompt);
      setEditedImageUrl(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
        try {
            const payload = await fileToBase64(file);
            const preview = URL.createObjectURL(file);
            setImageFile({ file, preview, payload });
            setError(null);
            setEditedImageUrl(null); // Clear previous edit
        } catch (e) {
            setError("Failed to read the image file.");
        }
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDownload = () => {
    if (!editedImageUrl) return;
    const a = document.createElement('a');
    a.href = editedImageUrl;
    a.download = `edited_image_${prompt.slice(0, 20).replace(/\s/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Image Editor" maxWidth="max-w-4xl">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Upload an image and describe the changes you want to see. The AI will magically edit it for you.
        </p>
        {!imageFile ? (
            <div 
                onDragEnter={handleDragEnter} 
                onDragLeave={handleDragLeave} 
                onDragOver={handleDragOver} 
                onDrop={handleDrop} 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors mb-4 ${isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-cyan-500 text-gray-400'}`}
            >
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div className="flex flex-col items-center justify-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <p className="font-semibold text-gray-200">Drag & drop an image here</p>
                    <p className="text-xs">or click to select a file</p>
                </div>
            </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the edit... e.g., Add a birthday hat to the cat"
                  rows={2}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim() || !imageFile}
                className="w-full bg-cyan-500 text-white rounded-md px-4 py-2.5 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex justify-center items-center"
              >
                {isLoading ? <Loader /> : 'Generate Edit'}
              </button>
            </form>
          </>
        )}

        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
        
        <div className="mt-6">
          {(isLoading || editedImageUrl || imageFile) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageFile && (
                    <div className="text-center">
                        <h3 className="font-semibold text-gray-300 mb-2">Original</h3>
                        <img src={imageFile.preview} alt="Original" className="rounded-lg w-full object-contain" />
                    </div>
                )}
                <div className="text-center">
                    <h3 className="font-semibold text-gray-300 mb-2">Edited</h3>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full bg-gray-700/50 rounded-lg aspect-square">
                            <Loader />
                        </div>
                    ) : editedImageUrl ? (
                        <div>
                            <img src={editedImageUrl} alt="AI edited image" className="rounded-lg w-full object-contain" />
                             <button
                                onClick={handleDownload}
                                className="w-full mt-4 text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600"
                            >
                                Download Edit
                            </button>
                        </div>
                    ) : (
                         <div className="flex justify-center items-center h-full bg-gray-800/50 rounded-lg aspect-square text-gray-500">
                            Your edit will appear here
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImageEditor;