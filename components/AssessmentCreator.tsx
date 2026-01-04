import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateAssessment } from '../services/geminiService';
import { AssessmentQuestion } from '../types';

interface AssessmentCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  learningContext: string;
}

type QuizState = 'idle' | 'generating' | 'taking' | 'finished';

const AssessmentCreator: React.FC<AssessmentCreatorProps> = ({ isOpen, onClose, learningContext }) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Reset state when modal is opened/closed or context changes
    if (isOpen) {
        setQuestions([]);
        setUserAnswers({});
        setScore(0);
        setError(null);
        setQuizState('idle');
    }
  }, [isOpen, learningContext]);

  const handleGenerate = async () => {
    if (!learningContext) {
      setError("No learning content provided. Please generate content in the Learning Hub first.");
      return;
    }
    setQuizState('generating');
    setError(null);
    try {
      const result = await generateAssessment(learningContext);
      if (result.length === 0) {
        setError("The AI could not generate a quiz from this content. Try a different topic.");
        setQuizState('idle');
      } else {
        setQuestions(result);
        setQuizState('taking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setQuizState('idle');
    }
  };
  
  const handleAnswerSelect = (questionIndex: number, option: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: option }));
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
  
  const handleRestart = () => {
    setUserAnswers({});
    setScore(0);
    setQuizState('taking');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assessment Creator">
      <div className="p-6">
        {quizState === 'idle' && (
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Quiz from Learning Hub</h3>
            {learningContext ? (
              <>
                <p className="text-sm text-gray-400 mb-4">Click below to generate a quiz based on the content you just learned.</p>
                <div className="bg-gray-900/50 p-3 rounded-md max-h-48 overflow-y-auto border border-gray-700 mb-4">
                  <p className="text-xs text-gray-300 whitespace-pre-wrap">{learningContext}</p>
                </div>
                <button onClick={handleGenerate} className="w-full bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600">
                  Generate Quiz
                </button>
              </>
            ) : (
              <p className="text-center text-gray-400 bg-gray-700/50 p-4 rounded-lg">
                Go to the <span className="font-bold text-cyan-400">Learning Hub</span> to generate content first, then create an assessment.
              </p>
            )}
          </div>
        )}

        {quizState === 'generating' && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}

        {quizState === 'taking' && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                <p className="font-semibold text-white mb-3">{qIndex + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-600 cursor-pointer">
                      <input type="radio" name={`question-${qIndex}`} value={option} checked={userAnswers[qIndex] === option} onChange={() => handleAnswerSelect(qIndex, option)} className="form-radio h-4 w-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-600" />
                      <span className="text-gray-300 text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={handleSubmitQuiz} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Submit Answers</button>
          </div>
        )}

        {quizState === 'finished' && (
            <div>
                <div className="text-center bg-gray-900/50 p-6 rounded-lg border border-cyan-500/50">
                    <h3 className="text-2xl font-bold text-cyan-400">Quiz Complete!</h3>
                    <p className="text-lg mt-2">Your Score: <span className="font-bold text-white">{score} / {questions.length}</span></p>
                </div>

                <div className="space-y-4 mt-6">
                    <h4 className="text-lg font-semibold">Review Your Answers:</h4>
                    {questions.map((q, qIndex) => {
                        const userAnswer = userAnswers[qIndex];
                        const isCorrect = userAnswer === q.answer;
                        return (
                            <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                                <p className="font-semibold text-white mb-2">{qIndex + 1}. {q.question}</p>
                                <p className={`text-sm p-2 rounded-md ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    Your answer: {userAnswer || "No answer"} {isCorrect ? '(Correct)' : '(Incorrect)'}
                                </p>
                                {!isCorrect && <p className="text-sm p-2 mt-1 rounded-md bg-gray-600 text-gray-300">Correct answer: {q.answer}</p>}
                            </div>
                        )
                    })}
                </div>
                 <button onClick={handleRestart} className="w-full mt-6 bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600">Retake Quiz</button>
            </div>
        )}

      </div>
    </Modal>
  );
};

export default AssessmentCreator;
