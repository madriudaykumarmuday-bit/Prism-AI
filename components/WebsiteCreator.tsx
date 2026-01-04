import React, { useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateWebsiteFiles } from '../services/geminiService';
import { WebsiteFile } from '../types';
import { Icon } from './Icon';

// Declare JSZip which is loaded from a script tag in index.html
declare var JSZip: any;

interface WebsiteCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadingMessages = [
    "Drafting the HTML structure...",
    "Styling the page with modern CSS...",
    "Adding JavaScript for interactivity...",
    "Assembling the website components...",
    "Finalizing the web package...",
];

const WebsiteCreator: React.FC<WebsiteCreatorProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<WebsiteFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [previewSrcDoc, setPreviewSrcDoc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please describe the website you want to create.");
      return;
    }
    
    let messageInterval: ReturnType<typeof setInterval> | null = null;
    try {
        setIsLoading(true);
        setError(null);
        setFiles(null);
        setPreviewSrcDoc('');

        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 3000);

        const result = await generateWebsiteFiles(prompt);
        setFiles(result);
        // Create a self-contained HTML for the iframe preview
        const fullHtml = result.html
            .replace('<head>', `<head><style>${result.css}</style>`)
            .replace('</body>', `<script>${result.js}</script></body>`);
        setPreviewSrcDoc(fullHtml);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while creating the website.");
    } finally {
      if (messageInterval) clearInterval(messageInterval);
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!files) return;
    
    const zip = new JSZip();
    zip.file("index.html", files.html);
    zip.file("style.css", files.css);
    zip.file("script.js", files.js);
    
    zip.generateAsync({ type: "blob" }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website_${prompt.slice(0, 20).replace(/\s/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Website Creator" maxWidth="max-w-6xl">
      <div className="flex h-[85vh]">
        {/* Form & Controls */}
        <div className="w-full md:w-1/3 p-4 border-r border-white/10 flex flex-col">
          <p className="text-sm text-gray-400 mb-4">
            Describe the single-page website you want to build. The AI will generate the HTML, CSS, and JavaScript files for you.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A modern portfolio website for a photographer named Jane Doe, with a gallery section and a contact form."
              rows={8}
              className="w-full flex-grow bg-black/20 border border-white/10 rounded-md p-2 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-4 bg-cyan-500 text-white rounded-md px-4 py-2.5 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex justify-center items-center"
            >
              {isLoading ? <Loader /> : 'Generate Website'}
            </button>
          </form>
           {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
           {files && !isLoading && (
              <button
                  onClick={handleDownload}
                  className="w-full mt-4 text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                  <Icon as="plus" className="w-4 h-4 transform rotate-45" />
                  <span>Download Website (.zip)</span>
              </button>
           )}
        </div>
        {/* Preview */}
        <div className="w-full md:w-2/3 p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-200 mb-2 flex-shrink-0">Live Preview</h3>
           <div className="flex-grow min-h-0 bg-black/20 border border-white/10 rounded-lg">
            {isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                    <Loader />
                    <p className="text-cyan-400 font-semibold mt-4">Generating your website...</p>
                    <p className="text-sm text-gray-300 mt-1">{loadingMessage}</p>
                </div>
            ) : files ? (
                <iframe
                    srcDoc={previewSrcDoc}
                    title="Website Preview"
                    className="w-full h-full bg-white rounded-lg"
                    sandbox="allow-scripts allow-same-origin"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <p>Your website preview will appear here.</p>
                </div>
            )}
           </div>
        </div>
      </div>
    </Modal>
  );
};

export default WebsiteCreator;
