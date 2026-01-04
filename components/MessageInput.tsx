

import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Language } from '../types';

interface MessageInputProps {
  onSend: (message: string, file: File | null) => void;
  disabled: boolean;
  isWebSearchEnabled: boolean;
  onWebSearchToggle: () => void;
  language: Language;
}

const AttachmentPreview: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
    const objectUrl = React.useMemo(() => URL.createObjectURL(file), [file]);
    
    useEffect(() => {
        // Clean up object URL when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
    }, [objectUrl]);

    return (
        <div className="relative inline-block bg-black/30 p-2 rounded-lg mr-2">
            <img 
                src={objectUrl} 
                alt={file.name} 
                className="w-16 h-16 object-cover rounded-md"
            />
            <button 
                onClick={onRemove} 
                className="absolute -top-2 -right-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-white"
                aria-label="Remove attachment"
            >
                <Icon as="x-circle" className="w-6 h-6" />
            </button>
        </div>
    );
};

const emojiCategories = [
  { name: 'Smileys', icon: '😀', emojis: ['😀', '😂', '😍', '😊', '😇', '🤔', '🤫', '😭', '🥳', '😎', '👍', '🙏', '👋', '❤️', '🔥', '💯'] },
  { name: 'Animals', icon: '🐶', emojis: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐵', '🙈', '🙉', '🙊'] },
  { name: 'Food', icon: '🍔', emojis: ['🍎', '🍌', '🍉', '🍇', '🍓', '🍔', '🍟', '🍕', '🌭', '🌮', '🍩', '☕️', '🍦', '🍰', '🍪', '🍿'] },
  { name: 'Activities', icon: '⚽️', emojis: ['⚽️', '🏀', '🏈', '⚾️', '🎾', '🏐', '🎱', '🏓', '🏸', '🏒', '⛳️', '🎣', '🎯', '🎮', '🎨', '🎤'] },
  { name: 'Objects', icon: '💻', emojis: ['💻', '📱', '⌚️', '📷', '💡', '🔨', '🚀', '🎉', '💰', '💎', '🎁', '🎈', '🔑', '⚙️', '📈', '📎'] },
];


export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, isWebSearchEnabled, onWebSearchToggle, language }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0].name);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition({ language });

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (transcript) {
        setText(prevText => prevText ? `${prevText} ${transcript}` : transcript);
    }
  }, [transcript]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  const handleSend = () => {
    if ((text.trim() || attachment) && !disabled) {
      onSend(text, attachment);
      setText('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
       if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleMicClick = () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
  }

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setAttachment(file);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  }
  
  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  
  const handleEmojiSelect = (emoji: string) => {
    setText(prevText => prevText + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div 
        className={`bg-black/20 backdrop-blur-md border rounded-lg p-2 flex flex-col transition-colors ${isDragging ? 'border-cyan-500' : 'border-white/10'}`}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
    >
       {attachment && (
        <div className="p-2 border-b border-white/10 mb-2">
            <AttachmentPreview file={attachment} onRemove={removeAttachment} />
        </div>
      )}
      <div className="relative flex items-end">
        {isEmojiPickerOpen && (
          <div ref={emojiPickerRef} className="absolute bottom-full mb-2 bg-gray-800/90 backdrop-blur-lg border border-white/10 rounded-lg p-2 z-10 w-80">
            <div className="flex border-b border-white/10 mb-2">
              {emojiCategories.map(category => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`text-xl p-2 rounded-t-md transition-colors ${activeCategory === category.name ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  title={category.name}
                  aria-label={`Category: ${category.name}`}
                >
                  {category.icon}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto pr-1">
              {emojiCategories.find(c => c.name === activeCategory)?.emojis.map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-2xl p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label={`Select emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
            onClick={onWebSearchToggle}
            disabled={disabled}
            className={`p-2 rounded-md transition-colors focus:outline-none ${isWebSearchEnabled ? 'text-cyan-400 bg-cyan-900/50' : 'text-gray-400 hover:text-white'}`}
            aria-label="Toggle web search"
            title={isWebSearchEnabled ? "Web search is ON" : "Web search is OFF"}
        >
            <Icon as="globe" className="w-5 h-5" />
        </button>
        <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or drop an image..."
            className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto max-h-48 px-2"
            rows={1}
            disabled={disabled}
        />
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
        />
        <button
            onClick={() => setIsEmojiPickerOpen(prev => !prev)}
            disabled={disabled}
            className="p-2 rounded-md text-gray-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Add emoji"
        >
            <Icon as="face-smile" className="w-5 h-5" />
        </button>
        <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded-md text-gray-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Attach file"
        >
            <Icon as="paperclip" className="w-5 h-5" />
        </button>
        {hasRecognitionSupport && (
            <button
                onClick={handleMicClick}
                disabled={disabled}
                className={`p-2 rounded-md ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'} hover:text-white transition-colors focus:outline-none`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
            >
                <Icon as="microphone" className="w-5 h-5" />
            </button>
        )}
        <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !attachment)}
            className="ml-2 p-2 rounded-md bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
            aria-label="Send message"
        >
            <Icon as="send" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};