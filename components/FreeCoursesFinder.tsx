import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { findFreeCourses } from '../services/geminiService';
import { FreeCourseResource } from '../types';
import { Icon } from './Icon';

interface FreeCoursesFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

const topics = {
    "Technical": [
        "Python Programming", "JavaScript", "Web Development", "React.js", "Node.js", "Data Science", "Machine Learning", "Deep Learning", "SQL & Databases", "Cloud Computing (AWS)", "DevOps", "Cybersecurity", "Go (Golang)", "UI/UX Design"
    ],
    "Non-Technical": [
        "Digital Marketing", "Content Creation", "Graphic Design", "Project Management", "Business Analytics", "Financial Markets", "Public Speaking", "Creative Writing", "Photography", "Music Theory", "Language Learning", "Personal Finance"
    ]
};

const FreeCoursesFinder: React.FC<FreeCoursesFinderProps> = ({ isOpen, onClose }) => {
    const [view, setView] = useState<'selection' | 'loading' | 'results'>('selection');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [results, setResults] = useState<FreeCourseResource[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleTopicSelect = async (topic: string) => {
        setSelectedTopic(topic);
        setView('loading');
        setError(null);
        setResults([]);
        try {
            const courses = await findFreeCourses(topic);
            setResults(courses);
            setView('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to find courses. Please try again.");
            setView('selection');
        }
    };

    const handleBack = () => {
        setView('selection');
        setSelectedTopic(null);
        setError(null);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setView('selection');
                setSelectedTopic(null);
                setResults([]);
                setError(null);
            }, 300); // Reset after modal closes
        }
    }, [isOpen]);

    const renderSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(topics).map(([category, topicList]) => (
                <div key={category}>
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                        {topicList.map(topic => (
                            <button
                                key={topic}
                                onClick={() => handleTopicSelect(topic)}
                                className="px-3 py-1.5 text-sm bg-gray-700/50 rounded-md hover:bg-cyan-500/30 transition-colors"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center p-10">
            <Loader />
            <p className="mt-4 text-cyan-400">Searching for the best free courses on</p>
            <p className="font-semibold text-white">{selectedTopic}...</p>
        </div>
    );

    const renderResults = () => (
        <div>
            <button onClick={handleBack} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Back to Topics</span>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Free Courses for <span className="text-cyan-400">{selectedTopic}</span></h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {results.length > 0 ? results.map((course, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <a href={course.url} target="_blank" rel="noopener noreferrer" className="block">
                            <h4 className="font-bold text-white hover:underline">{course.title}</h4>
                            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mt-1">{course.platform}</p>
                            <p className="text-gray-300 text-sm mt-2">{course.description}</p>
                        </a>
                    </div>
                )) : <p className="text-center text-gray-400">No courses found for this topic.</p>}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (view) {
            case 'selection': return renderSelection();
            case 'loading': return renderLoading();
            case 'results': return renderResults();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Free Courses Finder" maxWidth="max-w-4xl">
            <div className="p-6">
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
                {renderContent()}
            </div>
        </Modal>
    );
};

export default FreeCoursesFinder;