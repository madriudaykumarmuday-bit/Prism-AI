import React from 'react';
import { Icon } from './Icon';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteConversation(id);
    }
  };

  return (
    <aside className="flex flex-col w-80 flex-shrink-0 bg-black/20 backdrop-blur-lg border-r border-white/10 p-4 space-y-4">
      <button
        onClick={onNewConversation}
        className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white rounded-md py-2.5 px-4 font-semibold hover:bg-cyan-600 transition-colors"
      >
        <Icon as="plus" className="w-5 h-5" />
        New Chat
      </button>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {conversations.map(convo => (
          <div
            key={convo.id}
            onClick={() => onSelectConversation(convo.id)}
            className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
              activeConversationId === convo.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <p className="text-sm font-medium text-gray-200 truncate pr-6">{convo.title}</p>
            <p className="text-xs text-gray-500 truncate mt-1">
              {convo.messages[convo.messages.length - 1]?.content || '...'}
            </p>
            <button
              onClick={(e) => handleDelete(e, convo.id)}
              className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-gray-500 rounded-full hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete conversation"
            >
              <Icon as="x-circle" className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};