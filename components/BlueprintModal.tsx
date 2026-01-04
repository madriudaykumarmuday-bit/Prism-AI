import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BlueprintModal: React.FC<BlueprintModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/ARCHITECTURE.md')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(text => {
          setContent(text);
        })
        .catch(error => {
          console.error("Failed to load blueprint:", error);
          setContent("# Error\n\nFailed to load the project blueprint. Please check the console for more details.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Blueprint" maxWidth="max-w-4xl">
      <div className="p-6 max-h-[75vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div className="prose prose-invert prose-p:my-2 prose-headings:my-3 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: CodeBlock,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BlueprintModal;
