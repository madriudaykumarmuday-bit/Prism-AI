
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, MessageRole } from '../types';
import { Icon } from './Icon';
import { CodeBlock } from './CodeBlock';

interface MessageProps {
  message: ChatMessage;
  isStreaming: boolean;
}

const LoadingCursor = () => (
    <span className="animate-pulse inline-block w-2 h-5 bg-gray-400 ml-1" aria-hidden="true"></span>
);

const Sources: React.FC<{ chunks: ChatMessage['groundingChunks'] }> = ({ chunks }) => {
  if (!chunks || chunks.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/10 not-prose">
      <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Sources</h4>
      <div className="flex flex-col gap-2">
        {chunks.map((chunk, index) => {
          const isYoutubeLink = chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be');
          return (
            <a
              key={index}
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 truncate"
            >
              <Icon as={isYoutubeLink ? 'youtube' : 'link'} className={`w-4 h-4 flex-shrink-0 ${isYoutubeLink ? 'text-red-500' : ''}`} />
              <span className="truncate" title={chunk.web.title}>{chunk.web.title}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};


export const Message: React.FC<MessageProps> = ({ message, isStreaming }) => {
  const isModel = message.role === MessageRole.MODEL;

  useEffect(() => {
    const attachmentUrl = message.attachment?.url;
    // Clean up the object URL to avoid memory leaks
    return () => {
      if (attachmentUrl) {
        URL.revokeObjectURL(attachmentUrl);
      }
    };
  }, [message.attachment?.url]);

  return (
    <div className={`flex items-start gap-4 max-w-4xl mx-auto ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-gradient-to-br from-cyan-400 to-purple-500' : 'bg-indigo-500'}`}>
        <Icon as={isModel ? 'bot' : 'user'} className="w-5 h-5 text-white" />
      </div>
      <div className={`p-4 rounded-xl w-full prose prose-invert prose-p:my-2 prose-headings:my-3 backdrop-blur-md border border-white/10 ${isModel ? 'bg-gray-800/30' : 'bg-blue-900/30'}`}>
        {message.attachment && (
            <div className="mb-2">
                <img 
                    src={message.attachment.url} 
                    alt="User attachment"
                    className="max-w-xs rounded-lg border border-gray-600"
                />
            </div>
        )}
        <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                pre: CodeBlock
            }}
        >
            {message.content}
        </ReactMarkdown>
        {isStreaming && <LoadingCursor />}
        <Sources chunks={message.groundingChunks} />
      </div>
    </div>
  );
};
