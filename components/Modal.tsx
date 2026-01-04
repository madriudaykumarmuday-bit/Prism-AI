import React from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className={`bg-gray-900/60 backdrop-blur-xl rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col border border-white/10`}>
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <Icon as="x-circle" className="w-6 h-6" />
          </button>
        </header>
        <main className="overflow-y-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;