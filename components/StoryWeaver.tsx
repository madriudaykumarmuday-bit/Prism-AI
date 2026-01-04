import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateStory } from '../services/geminiService';
import { Story } from '../types';

interface StoryWeaverProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadingMessages = [
    "Thinking of a wonderful story...",
    "Writing the first scene...",
    "Illustrating the magical moments...",
    "Adding color to the characters...",
    "Putting the pages together...",
];

const StoryWeaver: React.FC<StoryWeaverProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please provide an idea for the story.");
      return;
    }
    
    let messageInterval: ReturnType<typeof setInterval> | null = null;
    try {
        setIsLoading(true);
        setError(null);
        setStory(null);

        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 4000);

        const result = await generateStory(prompt);
        setStory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while weaving the story.");
    } finally {
      if (messageInterval) clearInterval(messageInterval);
      setIsLoading(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `story_scene_${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleDownloadText = () => {
    if (!story) return;
    const textContent = `${story.title}\n\n${story.scenes.map((s, i) => `Scene ${i+1}\n\n${s.paragraph}`).join('\n\n')}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Story Weaver" maxWidth="max-w-4xl">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Enter a simple idea, and the AI will write and illustrate a short story for you.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-2 mb-6">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A brave knight and a friendly dragon..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex-shrink-0"
            >
              {isLoading ? <Loader /> : 'Weave Story'}
            </button>
          </div>
        </form>

        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        <div className="mt-6">
          {isLoading && (
            <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <p className="text-cyan-400 font-semibold mb-2">Weaving your story...</p>
                <p className="text-sm text-gray-300">{loadingMessage}</p>
                <div className="mt-4 flex justify-center"><Loader /></div>
            </div>
          )}
          {story && (
            <div>
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-cyan-400">{story.title}</h3>
                </div>
                <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                    {story.scenes.map((scene, index) => (
                        <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 grid md:grid-cols-2 gap-4 items-center">
                            <div className="relative group">
                                <img src={scene.imageUrl} alt={`Scene ${index + 1}`} className="rounded-md w-full object-contain" />
                                <button
                                    onClick={() => handleDownloadImage(scene.imageUrl, index)}
                                    className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                    aria-label="Download image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{scene.paragraph}</p>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleDownloadText}
                    className="w-full mt-6 text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                    Download Story Text
                </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StoryWeaver;