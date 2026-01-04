import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateBusinessIdea } from '../services/geminiService';
import { BusinessIdea } from '../types';
import { Icon } from './Icon';

interface BusinessIdeaSketchProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessIdeaSketch: React.FC<BusinessIdeaSketchProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter your business idea.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdea(null);
    try {
      const result = await generateBusinessIdea(prompt);
      setIdea(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const generateFileContent = (format: 'txt' | 'md'): { content: string; mimeType: string; extension: string } => {
    if (!idea) return { content: '', mimeType: '', extension: '' };

    const { ideaName, tagline, summary, targetAudience, keyFeatures, monetizationStrategy, marketingPlan, potentialRisks } = idea;
    const title = `Business Idea Sketch: ${ideaName}`;

    if (format === 'md') {
      const mdContent = `# ${title}\n\n**Tagline:** ${tagline}\n\n## Summary\n${summary}\n\n## Target Audience\n${targetAudience}\n\n## Key Features\n${keyFeatures.map(f => `- ${f}`).join('\n')}\n\n## Monetization Strategy\n${monetizationStrategy}\n\n## Marketing Plan\n${marketingPlan.map(p => `- ${p}`).join('\n')}\n\n## Potential Risks\n${potentialRisks.map(r => `- ${r}`).join('\n')}`;
      return { content: mdContent, mimeType: 'text/markdown;charset=utf-8', extension: 'md' };
    } else {
      const txtContent = `${title}\n${'='.repeat(title.length)}\n\nTagline: ${tagline}\n\nSummary:\n${summary}\n\nTarget Audience:\n${targetAudience}\n\nKey Features:\n${keyFeatures.map(f => `- ${f}`).join('\n')}\n\nMonetization Strategy:\n${monetizationStrategy}\n\nMarketing Plan:\n${marketingPlan.map(p => `- ${p}`).join('\n')}\n\nPotential Risks:\n${potentialRisks.map(r => `- ${r}`).join('\n')}`;
      return { content: txtContent, mimeType: 'text/plain;charset=utf-8', extension: 'txt' };
    }
  };

  const handleDownload = (format: 'txt' | 'md') => {
    const { content, mimeType, extension } = generateFileContent(format);
    if (!content) return;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_sketch_${idea!.ideaName.replace(/\s/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Business Idea Sketch" maxWidth="max-w-3xl">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Enter a basic concept, and the AI will flesh it out into a structured business plan sketch.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., An AI-powered meal planning app..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex-shrink-0"
          >
            {isLoading ? <Loader /> : 'Generate'}
          </button>
        </form>

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {idea && (
          <div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="text-center border-b border-gray-600 pb-3">
                <h3 className="text-xl font-bold text-cyan-400">{idea.ideaName}</h3>
                <p className="text-sm italic text-gray-300">"{idea.tagline}"</p>
              </div>
              
              <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-white">Summary</h4>
                    <p className="text-sm text-gray-300 mt-1">{idea.summary}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-white">Target Audience</h4>
                    <p className="text-sm text-gray-300 mt-1">{idea.targetAudience}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-white">Key Features</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                        {idea.keyFeatures.map((feat, i) => <li key={i}>{feat}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-white">Monetization Strategy</h4>
                    <p className="text-sm text-gray-300 mt-1">{idea.monetizationStrategy}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-white">Marketing Plan</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                        {idea.marketingPlan.map((plan, i) => <li key={i}>{plan}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-white">Potential Risks</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                        {idea.potentialRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                </div>
              </div>
            </div>
            <div className="relative mt-6">
              <button
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="w-full text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download Sketch</span>
              </button>
              {isDownloadMenuOpen && (
                <div ref={downloadMenuRef} className="absolute bottom-full mb-2 w-full bg-gray-600 border border-gray-500 rounded-md shadow-lg z-10">
                  <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 rounded-t-md">As Plain Text (.txt)</button>
                  <button onClick={() => handleDownload('md')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 rounded-b-md">As Markdown (.md)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BusinessIdeaSketch;
