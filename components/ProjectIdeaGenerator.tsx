import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateProjectIdeas } from '../services/geminiService';
import { ProjectIdea } from '../types';

interface ProjectIdeaGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectIdeaGenerator: React.FC<ProjectIdeaGeneratorProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas([]);
    try {
      const result = await generateProjectIdeas(topic);
      setIdeas(result);
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

  const generateFileContent = (format: 'txt' | 'md' | 'json'): { content: string; mimeType: string; extension: string } => {
    if (!ideas.length) return { content: '', mimeType: '', extension: '' };

    const title = `Project Ideas for "${topic}"`;

    switch (format) {
      case 'json':
        return {
          content: JSON.stringify({ title, ideas }, null, 2),
          mimeType: 'application/json;charset=utf-8',
          extension: 'json',
        };
      case 'md':
        const mdContent = `# ${title}\n\n${ideas.map(idea => `## ${idea.title}\n\n${idea.description}`).join('\n\n')}`;
        return {
          content: mdContent,
          mimeType: 'text/markdown;charset=utf-8',
          extension: 'md',
        };
      case 'txt':
      default:
        const txtContent = `${title}\n\n${'='.repeat(title.length)}\n\n${ideas.map(idea => `${idea.title}\n${idea.description}`).join('\n\n')}`;
        return {
          content: txtContent,
          mimeType: 'text/plain;charset=utf-8',
          extension: 'txt',
        };
    }
  };
  
  const handleDownload = (format: 'txt' | 'md' | 'json') => {
    const { content, mimeType, extension } = generateFileContent(format);
    if (!content) return;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_ideas_${topic.slice(0, 20).replace(/\s/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false);
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Idea Generator">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Enter a topic or your interests, and the AI will generate creative project ideas for you.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Python, Machine Learning, Web Dev..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? <Loader /> : 'Generate'}
          </button>
        </form>

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {ideas.length > 0 && (
          <div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <h3 className="text-lg font-semibold text-cyan-400">Here are some ideas for "{topic}":</h3>
              <ul className="space-y-3">
                {ideas.map((idea, index) => (
                  <li key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-bold text-white">{idea.title}</h4>
                    <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap">{idea.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-6">
              <button
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="w-full text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Ideas</span>
              </button>
              {isDownloadMenuOpen && (
                <div ref={downloadMenuRef} className="absolute bottom-full mb-2 w-full bg-gray-600 border border-gray-500 rounded-md shadow-lg z-10">
                  <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 transition-colors rounded-t-md">As Plain Text (.txt)</button>
                  <button onClick={() => handleDownload('md')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 transition-colors">As Markdown (.md)</button>
                  <button onClick={() => handleDownload('json')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 transition-colors rounded-b-md">As JSON (.json)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProjectIdeaGenerator;
