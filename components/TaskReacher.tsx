import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateTaskPlan } from '../services/geminiService';
import { TaskPlan } from '../types';
import { Icon } from './Icon';

interface TaskReacherProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskReacher: React.FC<TaskReacherProps> = ({ isOpen, onClose }) => {
  const [task, setTask] = useState('');
  const [level, setLevel] = useState('');
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !level.trim()) {
      setError("Please provide both a task and your level.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateTaskPlan(task, level);
      setPlan(result);
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
    if (!plan) return { content: '', mimeType: '', extension: '' };

    const title = `Task Plan: ${plan.taskTitle} (for a ${plan.userLevel})`;

    if (format === 'md') {
      const mdContent = `# ${title}\n\n${plan.steps.map(step => 
        `## Step ${step.step}: ${step.title}\n\n${step.description}\n\n${step.tip ? `**💡 Tip:** ${step.tip}\n` : ''}`
      ).join('\n---\n\n')}`;
      return { content: mdContent, mimeType: 'text/markdown;charset=utf-8', extension: 'md' };
    } else {
      const txtContent = `${title}\n${'='.repeat(title.length)}\n\n${plan.steps.map(step => 
        `Step ${step.step}: ${step.title}\n\n${step.description}\n\n${step.tip ? `Tip: ${step.tip}\n` : ''}`
      ).join('\n----------------------------------------\n\n')}`;
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
    a.download = `task_plan_${plan!.taskTitle.replace(/\s/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Reacher" maxWidth="max-w-3xl">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Describe any task and your level, and the AI will create a step-by-step guide to help you complete it.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-gray-400">Task / Goal</label>
             <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Write a book report on 'The Great Gatsby'"
              rows={3}
              className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <label className="text-xs font-semibold text-gray-400">Your Level</label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g., 10th Grader, University Student, Beginner"
                className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !task.trim() || !level.trim()}
              className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex-shrink-0"
            >
              {isLoading ? <Loader /> : 'Generate Plan'}
            </button>
          </div>
        </form>

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {plan && (
          <div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="text-center border-b border-gray-600 pb-3">
                <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">{plan.userLevel} Level</p>
                <h3 className="text-xl font-bold text-white mt-1">{plan.taskTitle}</h3>
              </div>
              
              <ol className="relative border-l border-gray-600 ml-2">
                {plan.steps.map((step) => (
                  <li key={step.step} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-cyan-800 rounded-full -left-3 ring-4 ring-gray-800 text-cyan-300 text-sm">
                      {step.step}
                    </span>
                    <h4 className="font-semibold text-white">{step.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{step.description}</p>
                    {step.tip && (
                      <p className="mt-2 text-xs p-2 rounded-md bg-cyan-900/40 border-l-2 border-cyan-500 text-cyan-200">
                        <span className="font-bold">💡 Tip:</span> {step.tip}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative mt-6">
              <button
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="w-full text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center space-x-2"
              >
                <Icon as="plus" className="w-4 h-4 transform rotate-45" />
                <span>Download Plan</span>
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

export default TaskReacher;
