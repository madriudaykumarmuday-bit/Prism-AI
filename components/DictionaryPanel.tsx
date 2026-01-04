import React, { useState } from 'react';
import { Icon } from './Icon';
import { getWordDefinition } from '../services/geminiService';
import { WordDefinition, Language } from '../types';
import Loader from './Loader';

interface DictionaryPanelProps {
  language: Language;
}

export const DictionaryPanel: React.FC<DictionaryPanelProps> = ({ language }) => {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uiText = {
    'English': {
      title: 'Dictionary',
      placeholder: 'Define a word...',
      errorNotFound: 'Could not find a definition for that word.',
      errorEnterWord: 'Please enter a word.',
      phonetic: 'Phonetic',
      partOfSpeech: 'Part of Speech',
      definition: 'Definition',
      example: 'Example',
      lookupPrompt: 'Look up a word to see its definition here.'
    },
    'Telugu': {
      title: 'నిఘంటువు',
      placeholder: 'పదాన్ని నిర్వచించండి...',
      errorNotFound: 'ఆ పదానికి నిర్వచనం కనుగొనబడలేదు.',
      errorEnterWord: 'దయచేసి ఒక పదాన్ని నమోదు చేయండి.',
      phonetic: 'ఉచ్చారణ',
      partOfSpeech: 'భాషా భాగం',
      definition: 'నిర్వచనం',
      example: 'ఉదాహరణ',
      lookupPrompt: 'నిర్వచనం చూడటానికి ఒక పదాన్ని వెతకండి.'
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
        setError(uiText[language].errorEnterWord);
        return;
    }
    setIsLoading(true);
    setError(null);
    setDefinition(null);
    try {
        const result = await getWordDefinition(word.trim(), language);
        setDefinition(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : uiText[language].errorNotFound);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <aside className="flex flex-col w-80 flex-shrink-0 bg-black/20 backdrop-blur-lg border-l border-white/10 p-4 space-y-4">
      <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
        <Icon as="book-open" className="w-6 h-6 text-cyan-400" />
        {uiText[language].title}
      </h2>
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder={uiText[language].placeholder}
          className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !word.trim()}
          className="bg-cyan-500 text-white rounded-md p-2 hover:bg-cyan-600 disabled:bg-gray-600"
        >
          <Icon as="magnifying-glass" className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-grow overflow-y-auto pr-2">
        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{error}</p>}
        {definition ? (
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h3 className="text-lg font-bold text-white">{definition.word}</h3>
              <p className="text-cyan-400">{definition.phonetic}</p>
            </div>
            <div className="bg-black/20 p-3 rounded-md border border-white/10">
              <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">{uiText[language].partOfSpeech}</p>
              <p className="mt-1">{definition.partOfSpeech}</p>
            </div>
             <div className="bg-black/20 p-3 rounded-md border border-white/10">
               <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">{uiText[language].definition}</p>
               <p className="mt-1">{definition.definition}</p>
             </div>
             <div className="bg-black/20 p-3 rounded-md border border-white/10">
               <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">{uiText[language].example}</p>
               <p className="mt-1 italic">"{definition.example}"</p>
             </div>
          </div>
        ) : (
            !isLoading && !error && <p className="text-center text-gray-500 text-sm mt-10">{uiText[language].lookupPrompt}</p>
        )}
      </div>
    </aside>
  );
};