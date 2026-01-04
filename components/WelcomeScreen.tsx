import React from 'react';
import { Icon } from './Icon';

interface WelcomeScreenProps {
  sendMessage: (message: string, file?: File | null) => void;
}

const examplePrompts = [
  "Brainstorm a marketing slogan for a new cross-platform app, then adapt it for Twitter, Instagram, and a blog post.",
  "Explain quantum computing in simple terms.",
  "Write a Python script to scrape a website.",
];


export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ sendMessage }) => {
  const handleOpenBlueprint = () => {
    window.dispatchEvent(new CustomEvent('openBlueprint'));
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-4 mb-8">
        <Icon as="prism" className="w-16 h-16 text-cyan-400" />
        <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
                Welcome To Prism AI 👋
            </h1>
            <p className="text-lg text-gray-300">How can I help you today?</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => sendMessage(prompt)}
            className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-left hover:bg-white/10 transition-colors"
          >
            <p className="font-semibold text-gray-100">{prompt}</p>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center border-t border-white/10 pt-8 w-full max-w-4xl">
        <p className="text-gray-400">Want to see the vision behind the project?</p>
        <button
            onClick={handleOpenBlueprint}
            className="mt-2 text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors flex items-center gap-2 mx-auto"
        >
            <Icon as="document-text" className="w-5 h-5" />
            <span>View the Project Blueprint & Architectural Vision</span>
        </button>
    </div>
    </div>
  );
};