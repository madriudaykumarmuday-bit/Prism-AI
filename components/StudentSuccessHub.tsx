import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateStudentQuiz, groundedSearch } from '../services/geminiService';
import { StudentQuizQuestion, GroundingSource } from '../types';

interface StudentSuccessHubProps {
  isOpen: boolean;
  onClose: () => void;
}

type QuizState = 'grade_selection' | 'subject_selection' | 'generating' | 'taking' | 'finished';
type ViewState = 'quiz' | 'search';

const grades = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade"];
const subjectsByGrade: Record<string, string[]> = {
    "default": ["Math", "Science", "English", "Social Studies"],
    "6th Grade": ["Math", "Science", "English", "Social Studies", "Telugu", "Hindi"],
    "7th Grade": ["Math", "Science", "English", "Social Studies", "Telugu", "Hindi"],
    "8th Grade": ["Math", "Science", "English", "Social Studies", "Telugu", "Hindi"],
    "9th Grade": ["Math", "Physics", "Chemistry", "Biology", "History", "Telugu", "Hindi"],
    "10th Grade": ["Math", "Physics", "Chemistry", "Biology", "History", "Telugu", "Hindi"]
};

const StudentSuccessHub: React.FC<StudentSuccessHubProps> = ({ isOpen, onClose }) => {
    // Quiz state
    const [quizState, setQuizState] = useState<QuizState>('grade_selection');
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [questions, setQuestions] = useState<StudentQuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search state
    const [currentView, setCurrentView] = useState<ViewState>('quiz');
    const [isSearching, setIsSearching] = useState(false);
    const [searchPrompt, setSearchPrompt] = useState('');
    const [searchResult, setSearchResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleRestart = () => {
        setQuizState('grade_selection');
        setSelectedGrade(null);
        setSelectedSubject(null);
        setQuestions([]);
        setUserAnswers({});
        setScore(0);
        setError(null);
        setCurrentView('quiz');
        setSearchPrompt('');
        setSearchResult(null);
        setSearchError(null);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(handleRestart, 300); // Reset after closing animation
        }
    }, [isOpen]);

    const handleGradeSelect = (grade: string) => {
        setSelectedGrade(grade);
        setQuizState('subject_selection');
    };

    const handleSubjectSelect = async (subject: string) => {
        if (!selectedGrade) return;
        setSelectedSubject(subject);
        setQuizState('generating');
        setError(null);
        try {
            const result = await generateStudentQuiz(selectedGrade, subject);
            if (result.length === 0) {
                throw new Error("The AI couldn't generate a quiz for this topic. Please try another one.");
            }
            setQuestions(result);
            setQuizState('taking');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setQuizState('subject_selection'); // Go back to subject selection on error
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

    const handlePerformSearch = async (promptToSearch: string) => {
        if (!promptToSearch.trim()) {
          setSearchError("Please enter a search query.");
          return;
        }
        setIsSearching(true);
        setSearchError(null);
        setSearchResult(null);
        try {
          const response = await groundedSearch(promptToSearch);
          setSearchResult(response);
        } catch (err) {
          setSearchError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
          setIsSearching(false);
        }
    };
    
    const handleInitiateSearch = () => {
        const defaultPrompt = `Online learning platforms for ${selectedSubject} for a ${selectedGrade} student`;
        setSearchPrompt(defaultPrompt);
        setCurrentView('search');
        handlePerformSearch(defaultPrompt);
    };
    
    const renderGradeSelection = () => (
        <div>
            <h3 className="text-xl font-bold text-cyan-400 text-center">Welcome to the Student Success Hub!</h3>
            <p className="mt-2 text-gray-300 text-center">Let's get started. Please select your grade level.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
                {grades.map(grade => (
                    <button
                        key={grade}
                        onClick={() => handleGradeSelect(grade)}
                        className="p-4 bg-gray-700/50 rounded-lg text-center font-semibold text-white hover:bg-cyan-500/30 hover:ring-2 hover:ring-cyan-500 transition-all duration-200"
                    >
                        {grade}
                    </button>
                ))}
            </div>
        </div>
    );
    
    const renderSubjectSelection = () => {
        if (!selectedGrade) return null;
        const subjectList = subjectsByGrade[selectedGrade] || subjectsByGrade.default;
        return (
            <div>
                 <button onClick={() => setQuizState('grade_selection')} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span>Back to Grade Selection</span>
                </button>
                <h3 className="text-xl font-bold text-cyan-400 text-center">Hello, {selectedGrade} Student!</h3>
                <p className="mt-2 text-gray-300 text-center">Which subject would you like to practice today?</p>
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                     {subjectList.map(subject => (
                        <button
                            key={subject}
                            onClick={() => handleSubjectSelect(subject)}
                            className="p-4 bg-gray-700/50 rounded-lg text-center font-semibold text-white hover:bg-cyan-500/30 hover:ring-2 hover:ring-cyan-500 transition-all duration-200"
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderQuizTaking = () => (
        <div>
            <h3 className="text-xl font-bold text-cyan-400 mb-6 text-center">{selectedGrade} {selectedSubject} Quiz</h3>
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

    const renderQuizFinished = () => (
         <div>
            <div className="text-center bg-gray-900/50 p-6 rounded-lg border border-cyan-500/50">
                <h3 className="text-2xl font-bold text-cyan-400">Great Job!</h3>
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
                 <button onClick={() => setQuizState('subject_selection')} className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-500">
                    Try Another Subject
                </button>
                <button onClick={handleInitiateSearch} className="w-full bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600">
                    Find Learning Resources
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        if (currentView === 'search') return renderWebSearch();

        switch (quizState) {
            case 'grade_selection': return renderGradeSelection();
            case 'subject_selection': return renderSubjectSelection();
            case 'generating': return <div className="flex flex-col items-center justify-center p-10"><Loader /><p className="mt-4 text-cyan-400">Building your quiz...</p></div>;
            case 'taking': return renderQuizTaking();
            case 'finished': return renderQuizFinished();
            default: return renderGradeSelection();
        }
    };
    
    const renderWebSearch = () => (
    <div>
        <button onClick={() => setCurrentView('quiz')} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span>Back to Quiz Results</span>
        </button>
        <h3 className="text-xl font-bold text-white mb-1">Find Learning Resources</h3>
        <p className="text-gray-400 text-sm mb-4">Showing results for: <span className="font-semibold text-gray-200">{selectedSubject}</span></p>

        <form onSubmit={(e) => { e.preventDefault(); handlePerformSearch(searchPrompt); }} className="flex items-center space-x-2">
            <input
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Search for resources..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400"
                disabled={isSearching}
            />
            <button type="submit" disabled={isSearching || !searchPrompt.trim()} className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 disabled:bg-gray-600">
                {isSearching ? <Loader /> : 'Search'}
            </button>
        </form>

        <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {isSearching && <div className="flex justify-center pt-10"><Loader /></div>}
            {searchError && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{searchError}</p>}
            
            {searchResult && (
                <>
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                        <p className="whitespace-pre-wrap text-gray-200 text-sm">{searchResult.text}</p>
                    </div>
                    {searchResult.sources.length > 0 && (
                        <div>
                            <h4 className="font-bold text-md mb-2 text-cyan-400">Sources</h4>
                            <ul className="space-y-2">
                                {searchResult.sources.map((source, index) => (
                                    <li key={index} className="text-sm bg-gray-700/50 p-3 rounded-md">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all" title={source.uri}>
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Student Success Hub">
            <div className="p-6">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default StudentSuccessHub;