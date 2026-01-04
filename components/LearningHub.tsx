import React, { useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateLearningContent } from '../services/geminiService';
import { LearningModule } from '../types';
import { Icon } from './Icon';

interface LearningHubProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAssessment: (context: string) => void;
}

const LearningHub: React.FC<LearningHubProps> = ({ isOpen, onClose, onCreateAssessment }) => {
  const [topic, setTopic] = useState('');
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic to learn about.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setModules([]);
    try {
      const result = await generateLearningContent(topic);
      setModules(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssessmentClick = () => {
    const context = modules.map(m => `Title: ${m.title}\n\nContent: ${m.content}`).join('\n\n---\n\n');
    onCreateAssessment(context);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Learning Hub">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Enter a topic you want to learn about, and the AI will generate a concise learning module for you.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Quantum Computing, Roman History..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? <Loader /> : 'Learn'}
          </button>
        </form>

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {modules.length > 0 && (
          <div>
            <div className="space-y-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700 max-h-[50vh] overflow-y-auto pr-2">
              <h3 className="text-xl font-bold text-cyan-400 border-b border-gray-600 pb-2">Learning Module: {topic}</h3>
              {modules.map((mod, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg text-white">{mod.title}</h4>
                  <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{mod.content}</p>
                </div>
              ))}
            </div>

            <button
                onClick={handleCreateAssessmentClick}
                className="w-full mt-6 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <span>Create Assessment</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LearningHub;
