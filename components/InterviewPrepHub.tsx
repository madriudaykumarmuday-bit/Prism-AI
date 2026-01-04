import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateInterviewQuiz } from '../services/geminiService';
import { InterviewQuestion } from '../types';

interface InterviewPrepHubProps {
  isOpen: boolean;
  onClose: () => void;
}

type QuizState = 'topic_selection' | 'generating' | 'taking' | 'finished';

const topics = ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"];

const InterviewPrepHub: React.FC<InterviewPrepHubProps> = ({ isOpen, onClose }) => {
    const [quizState, setQuizState] = useState<QuizState>('topic_selection');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRestart = () => {
        setQuizState('topic_selection');
        setSelectedTopic(null);
        setQuestions([]);
        setUserAnswers({});
        setScore(0);
        setError(null);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(handleRestart, 300); // Reset after closing animation
        }
    }, [isOpen]);


    const handleTopicSelect = async (topic: string) => {
        setSelectedTopic(topic);
        setQuizState('generating');
        setError(null);
        setIsLoading(true);
        try {
            const result = await generateInterviewQuiz(topic);
            if (result.length === 0) {
                throw new Error("The AI couldn't generate a quiz for this topic. Please try another one.");
            }
            setQuestions(result);
            setQuizState('taking');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setQuizState('topic_selection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerSelect = (qIndex: number, option: string) => {
        setUserAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleSubmitQuiz = () => {
        let newScore = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.answer) {
                newScore++;
            }
        });
        setScore(newScore);
        setQuizState('finished');
    };
    
    const handleRetake = () => {
        if(selectedTopic) {
            handleTopicSelect(selectedTopic);
        }
    };

    const renderContent = () => {
        switch (quizState) {
            case 'topic_selection':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-cyan-400 text-center">Interview Prep Hub</h3>
                        <p className="mt-2 text-gray-300 text-center">Sharpen your skills. Choose a topic to practice.</p>
                        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                            {topics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => handleTopicSelect(topic)}
                                    className="p-4 bg-gray-700/50 rounded-lg text-center font-semibold text-white hover:bg-cyan-500/30 hover:ring-2 hover:ring-cyan-500 transition-all duration-200"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            
            case 'generating':
                return <div className="flex flex-col items-center justify-center p-10"><Loader /><p className="mt-4 text-cyan-400">Generating your assessment...</p></div>;

            case 'taking':
                return (
                    <div>
                        <h3 className="text-xl font-bold text-cyan-400 mb-6 text-center">{selectedTopic} Assessment</h3>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                            {questions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                                <p className="font-semibold text-white mb-3">{qIndex + 1}. {q.question}</p>
                                <div className="space-y-2">
                                {q.options.map((option, oIndex) => (
                                    <label key={oIndex} className={`flex items-start space-x-3 p-3 rounded-md transition-colors cursor-pointer ${userAnswers[qIndex] === option ? 'bg-cyan-500/30 ring-2 ring-cyan-500' : 'hover:bg-gray-600'}`}>
                                    <input type="radio" name={`question-${qIndex}`} value={option} checked={userAnswers[qIndex] === option} onChange={() => handleAnswerSelect(qIndex, option)} className="form-radio h-4 w-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-600 mt-1 flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">{option}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                            ))}
                        </div>
                        <button onClick={handleSubmitQuiz} disabled={Object.keys(userAnswers).length !== questions.length} className="w-full mt-6 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            Submit Answers
                        </button>
                    </div>
                );

            case 'finished':
                return (
                    <div>
                        <div className="text-center bg-gray-900/50 p-6 rounded-lg border border-cyan-500/50">
                            <h3 className="text-2xl font-bold text-cyan-400">Assessment Complete!</h3>
                            <p className="text-lg mt-2">Your Score: <span className="font-bold text-white">{score} / {questions.length}</span></p>
                        </div>
                        <div className="space-y-4 mt-6 max-h-[50vh] overflow-y-auto pr-2">
                            <h4 className="text-lg font-semibold text-white">Review Your Answers:</h4>
                            {questions.map((q, qIndex) => {
                                const userAnswer = userAnswers[qIndex];
                                const isCorrect = userAnswer === q.answer;
                                return (
                                    <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                                        <p className="font-semibold text-white mb-2">{qIndex + 1}. {q.question}</p>
                                        <p className={`text-sm p-2 rounded-md ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            Your answer: {userAnswer || "No answer"}
                                        </p>
                                        {!isCorrect && <p className="text-sm p-2 mt-1 rounded-md bg-gray-600/50 text-gray-300">Correct answer: {q.answer}</p>}
                                        <div className="text-sm p-2 mt-2 rounded-md bg-cyan-900/40 border-l-4 border-cyan-500 text-cyan-200">
                                            <span className="font-bold">💡 Explanation:</span> {q.explanation}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                             <button onClick={handleRestart} className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-500">
                                Try Another Topic
                            </button>
                            <button onClick={handleRetake} className="w-full bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600">
                                Retake Quiz
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Interview Prep Hub">
            <div className="p-6">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default InterviewPrepHub;