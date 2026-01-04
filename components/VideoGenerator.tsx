import React, { useState, useRef } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateVideo, pollVideoOperation } from '../services/geminiService';

interface VideoGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadingMessages = [
    "Warming up the video synthesizer...",
    "Analyzing prompt and preparing assets...",
    "Rendering initial frames, this may take a moment...",
    "AI is directing the scene, please wait...",
    "Applying visual effects and color grading...",
    "Almost there, finalizing the video sequence...",
];

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

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<{ file: File, preview: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = () => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
  };
  
  const pollForVideo = async (operation: any) => {
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
    }, 10000); // Change message every 10 seconds

    while (true) {
        try {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            const updatedOperation = await pollVideoOperation(operation);
            operation = updatedOperation;

            if (updatedOperation.done) {
                const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch video file from Google Cloud Storage: ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setVideoUrl(url);
                } else {
                   throw new Error("Video generation completed, but no video URL was found.");
                }
                break; // Exit loop
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during polling.");
            break; // Exit loop on error
        }
    }

    clearInterval(messageInterval);
    setIsLoading(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    
    cleanup();
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
        let imagePayload;
        if (imageFile) {
            imagePayload = await fileToBase64(imageFile.file);
        }
        const initialOperation = await generateVideo(prompt, imagePayload);
        await pollForVideo(initialOperation);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImageFile({ file, preview });
    }
  };

  const removeImage = () => {
    if (imageFile) {
        URL.revokeObjectURL(imageFile.preview);
        setImageFile(null);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); cleanup(); }} title="AI Video Generator">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Describe a video scene or upload an image to animate. Video generation can take several minutes.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A majestic dragon flying over a mountain range..."
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
            <div className="mb-4">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-sm bg-gray-600 text-cyan-300 px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
                    Upload Image to Animate (Optional)
                </button>
            </div>

            {imageFile && (
                <div className="mb-4 relative w-fit mx-auto">
                    <img src={imageFile.preview} alt="upload preview" className="h-24 w-24 object-cover rounded-md" />
                     <button onClick={removeImage} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-gray-600">✕</button>
                </div>
            )}

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-cyan-500 text-white rounded-md px-4 py-2.5 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex justify-center items-center"
          >
            {isLoading ? <Loader /> : 'Generate Video'}
          </button>
        </form>

        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
        
        <div className="mt-6">
          {isLoading && (
            <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <p className="text-cyan-400 font-semibold mb-2">Generating Video...</p>
                <p className="text-sm text-gray-300">{loadingMessage}</p>
                <div className="mt-4 flex justify-center"><Loader /></div>
            </div>
          )}
          {videoUrl && (
            <div>
              <video controls src={videoUrl} className="w-full rounded-lg" />
              <a
                href={videoUrl}
                download={`generated_video_${prompt.slice(0, 20).replace(/\s/g, '_')}.mp4`}
                className="block w-full mt-4 text-center text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Download Video
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VideoGenerator;