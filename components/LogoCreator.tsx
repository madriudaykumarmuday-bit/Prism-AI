import React, { useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateLogos } from '../services/geminiService';

interface LogoCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadingMessages = [
    "Sketching initial concepts...",
    "Mixing the color palette...",
    "Refining the typography...",
    "Adding the finishing touches...",
    "Polishing the final designs...",
];

const LogoCreator: React.FC<LogoCreatorProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'Minimalist' | 'Modern' | 'Vintage' | 'Abstract'>('Minimalist');
  const [colors, setColors] = useState('');
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please describe the logo you want to create.");
      return;
    }
    
    let messageInterval: ReturnType<typeof setInterval> | null = null;
    try {
        setIsLoading(true);
        setError(null);
        setGeneratedLogos([]);

        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 3000);

        const fullPrompt = `A professional vector logo for "${prompt}". Style: ${style}. ${colors ? `Color Palette: ${colors}.` : ''} The logo should be on a clean, solid white background, suitable for branding.`;
        const result = await generateLogos(fullPrompt);
        setGeneratedLogos(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while creating logos.");
    } finally {
      if (messageInterval) clearInterval(messageInterval);
      setIsLoading(false);
    }
  };

  const handleDownload = (logoUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = logoUrl;
    a.download = `logo_${prompt.slice(0, 15).replace(/\s/g, '_')}_${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Logo Creator">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Describe your brand, choose a style, and specify colors to generate unique logo concepts.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-2 font-semibold">Logo Description</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A coffee shop named 'Bean Scene' with a steaming mug icon"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
             <label className="text-sm text-gray-400 block mb-2 font-semibold">Style</label>
             <div className="flex flex-wrap gap-2">
                {(['Minimalist', 'Modern', 'Vintage', 'Abstract'] as const).map(s => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${style === s ? 'bg-cyan-500 text-white font-semibold' : 'bg-gray-600 hover:bg-gray-500'}`}
                    >
                        {s}
                    </button>
                ))}
             </div>
          </div>
          <div className="mb-6">
            <label className="text-sm text-gray-400 block mb-2 font-semibold">Color Palette (Optional)</label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g., Warm earthy tones, blue and silver"
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-cyan-500 text-white rounded-md px-4 py-2.5 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex justify-center items-center"
          >
            {isLoading ? <Loader /> : 'Generate Logos'}
          </button>
        </form>

        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
        
        <div className="mt-6">
          {isLoading && (
            <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <p className="text-cyan-400 font-semibold mb-2">Creating your logos...</p>
                <p className="text-sm text-gray-300">{loadingMessage}</p>
                <div className="mt-4 flex justify-center"><Loader /></div>
            </div>
          )}
          {generatedLogos.length > 0 && (
            <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Your Logo Concepts</h3>
                <div className="grid grid-cols-2 gap-4">
                    {generatedLogos.map((logoSrc, index) => (
                        <div key={index} className="relative group bg-gray-700/50 rounded-lg p-2 flex items-center justify-center">
                            <img src={logoSrc} alt={`Generated Logo ${index + 1}`} className="rounded-md w-full object-contain" />
                            <button
                                onClick={() => handleDownload(logoSrc, index)}
                                className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                aria-label="Download logo"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LogoCreator;