
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Message } from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.map((msg, index) => (
         <Message 
            key={msg.id} 
            message={msg} 
            isStreaming={isLoading && index === messages.length - 1} 
         />
      ))}
    </div>
  );
};
