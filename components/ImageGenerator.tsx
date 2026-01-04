import React, { useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateImage } from '../services/geminiService';

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage(prompt, aspectRatio);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `generated_image_${prompt.slice(0, 20).replace(/\s/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Image Generator">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Describe the image you want to create. Be as detailed as you like.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic city skyline at sunset, with flying cars..."
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
             <label className="text-sm text-gray-400 block mb-2">Aspect Ratio</label>
             <div className="flex flex-wrap gap-2">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map(ratio => (
                    <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${aspectRatio === ratio ? 'bg-cyan-500 text-white font-semibold' : 'bg-gray-600 hover:bg-gray-500'}`}
                    >
                        {ratio}
                    </button>
                ))}
             </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-cyan-500 text-white rounded-md px-4 py-2.5 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? <Loader /> : 'Generate Image'}
          </button>
        </form>

        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
        
        <div className="mt-6">
          {isLoading && (
            <div className="flex justify-center items-center h-64 bg-gray-700/50 rounded-lg">
                <Loader />
            </div>
          )}
          {generatedImage && (
            <div>
              <img src={generatedImage} alt="AI generated image" className="rounded-lg w-full object-contain" />
              <button
                onClick={handleDownload}
                className="w-full mt-4 text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Image</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImageGenerator;