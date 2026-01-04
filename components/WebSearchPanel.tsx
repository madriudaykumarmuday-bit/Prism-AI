

import React, { useState, useEffect, useRef } from 'react';
import { GroundingSource } from '../types';
import { groundedSearch } from '../services/geminiService';
import Loader from './Loader';

interface WebSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WebSearchPanel: React.FC<WebSearchPanelProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a search query.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const fullPrompt = `Answer the following question based on information from the web, prioritizing YouTube content if relevant: ${prompt}`;
      const response = await groundedSearch(fullPrompt);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFileContent = (format: 'txt' | 'md' | 'html'): { content: string; mimeType: string; extension: string } => {
    if (!result) return { content: '', mimeType: '', extension: '' };

    switch (format) {
      case 'md':
        return {
          content: `# Search Result for: "${prompt}"\n\n## Answer\n\n${result.text}\n\n---\n\n## Sources\n\n${result.sources.map(s => `* **[${s.title || 'Untitled'}](${s.uri})**`).join('\n')}`,
          mimeType: 'text/markdown;charset=utf-8',
          extension: 'md',
        };
      case 'html':
        const sourcesHtml = result.sources.map(s => `<li><a href="${s.uri}" target="_blank" rel="noopener noreferrer">${s.title || s.uri}</a></li>`).join('');
        return {
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search Result for: ${prompt}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 20px auto; padding: 0 20px; background-color: #fdfdfd; }
        h1, h2 { color: #1a1a1a; }
        h1 { font-size: 1.8em; margin-bottom: 0.5em; }
        h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 2em;}
        .container { border: 1px solid #ddd; padding: 20px 30px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .answer { background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 10px; background-color: #f9f9f9; padding: 10px; border-radius: 5px; word-wrap: break-word; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        small { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Search Result</h1>
        <small>Query: <strong>${prompt}</strong></small>
        <h2>Answer</h2>
        <div class="answer">${result.text.replace(/\n/g, '<br>')}</div>
        <h2>Sources</h2>
        <ul>${sourcesHtml}</ul>
    </div>
</body>
</html>`,
          mimeType: 'text/html;charset=utf-8',
          extension: 'html',
        };
      case 'txt':
      default:
        const sourcesText = result.sources.map(s => `- ${s.title}: ${s.uri}`).join('\n');
        return {
          content: `Query: ${prompt}\n\nAnswer:\n${result.text}\n\nSources:\n${sourcesText}`,
          mimeType: 'text/plain;charset=utf-8',
          extension: 'txt',
        };
    }
  };

  const handleDownload = (format: 'txt' | 'md' | 'html') => {
    const { content, mimeType, extension } = generateFileContent(format);
    if (!content) return;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search_result_${prompt.slice(0, 20).replace(/\s/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false); // Close menu after download
  };
  
  // Reset state when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setPrompt('');
        setResult(null);
        setIsLoading(false);
        setError(null);
      }, 300); // Delay reset to allow for closing animation
    }
  }, [isOpen]);

  // Click outside handler for dropdown
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
  }, [downloadMenuRef]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900/60 backdrop-blur-xl shadow-2xl z-30 transform transition-transform duration-300 ease-in-out border-l border-white/10 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="web-search-panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <h2 id="web-search-panel-title" className="text-lg font-semibold text-white">
              Web Search
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close search panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Search Bar */}
          <div className="p-4 flex-shrink-0 border-b border-white/10">
            <p className="text-sm text-gray-400 mb-3">Ask a question, and the AI will search for answers, providing sources from the web.</p>
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Latest news on AI..."
                className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? '...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
            {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
            
            {result && (
                <div>
                    <div className="p-4 bg-black/20 rounded-lg mb-4">
                        <h3 className="font-bold text-lg mb-2 text-cyan-400">Answer</h3>
                        <p className="whitespace-pre-wrap text-gray-200 text-sm sm:text-base">{result.text}</p>
                    </div>

                    {result.sources.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-bold text-md mb-2 text-cyan-400">Sources</h4>
                            <ul className="space-y-2">
                                {result.sources.map((source, index) => (
                                    <li key={index} className="text-sm bg-black/20 p-3 rounded-md">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all" title={source.uri}>
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="relative mt-4">
                        <button
                        onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                        className="w-full text-sm bg-black/20 text-cyan-300 border border-white/10 px-4 py-2 rounded-md hover:bg-white/10 transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download Result</span>
                        </button>
                        {isDownloadMenuOpen && (
                        <div ref={downloadMenuRef} className="absolute bottom-full mb-2 w-full bg-gray-800/80 backdrop-blur-lg border border-white/10 rounded-md shadow-lg z-10">
                            <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors rounded-t-md">As Plain Text (.txt)</button>
                            <button onClick={() => handleDownload('md')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors">As Markdown (.md)</button>
                            <button onClick={() => handleDownload('html')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors rounded-b-md">As HTML (.html)</button>
                        </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WebSearchPanel;