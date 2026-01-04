import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateCourseContent } from '../services/geminiService';
import { Course } from '../types';
import { Icon } from './Icon';

interface CourseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const CourseCreator: React.FC<CourseCreatorProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic to create a course about.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setCourse(null);
    try {
      const result = await generateCourseContent(topic);
      setCourse(result);
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
    if (!course) return { content: '', mimeType: '', extension: '' };

    const { title, modules } = course;

    switch (format) {
      case 'json':
        return {
          content: JSON.stringify(course, null, 2),
          mimeType: 'application/json;charset=utf-8',
          extension: 'json',
        };
      case 'md':
        const mdContent = `# ${title}\n\n${modules.map(mod => 
          `## ${mod.title}\n\n${mod.description}\n\n**YouTube Resources:**\n${mod.youtubeLinks.map(link => `- [${link.title}](${link.url})`).join('\n')}`
        ).join('\n\n---\n\n')}`;
        return {
          content: mdContent,
          mimeType: 'text/markdown;charset=utf-8',
          extension: 'md',
        };
      case 'txt':
      default:
        const txtContent = `${title}\n\n${'='.repeat(title.length)}\n\n${modules.map(mod => 
          `Module: ${mod.title}\nDescription: ${mod.description}\nYouTube Resources:\n${mod.youtubeLinks.map(link => `  - ${link.title}: ${link.url}`).join('\n')}`
        ).join('\n\n')}`;
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
    a.download = `course_outline_${topic.slice(0, 20).replace(/\s/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Course Creator">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Enter a topic, and the AI will generate a course outline with descriptions and relevant YouTube video links.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Introduction to React Hooks..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex-shrink-0"
          >
            {isLoading ? <Loader /> : 'Generate'}
          </button>
        </form>

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {course && (
          <div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <h3 className="text-xl font-bold text-cyan-400 border-b border-gray-600 pb-2">{course.title}</h3>
              {course.modules.map((mod, index) => (
                <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-white">{index + 1}. {mod.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{mod.description}</p>
                  <div className="mt-3">
                    <h5 className="text-xs font-bold uppercase text-gray-400">YouTube Resources</h5>
                    <ul className="mt-2 space-y-2">
                        {mod.youtubeLinks.map((link, linkIndex) => (
                            <li key={linkIndex}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200">
                                    <Icon as="youtube" className="w-4 h-4 text-red-500 flex-shrink-0"/>
                                    <span className="truncate" title={link.title}>{link.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative mt-6">
              <button
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="w-full text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center space-x-2"
              >
                <Icon as="plus" className="h-4 w-4 transform rotate-45" />
                <span>Download Outline</span>
              </button>
              {isDownloadMenuOpen && (
                <div ref={downloadMenuRef} className="absolute bottom-full mb-2 w-full bg-gray-600 border border-gray-500 rounded-md shadow-lg z-10">
                  <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 rounded-t-md">As Plain Text (.txt)</button>
                  <button onClick={() => handleDownload('md')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">As Markdown (.md)</button>
                  <button onClick={() => handleDownload('json')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 rounded-b-md">As JSON (.json)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CourseCreator;