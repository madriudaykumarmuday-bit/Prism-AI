
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Icon } from './Icon';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string; // Passed by react-markdown
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!React.isValidElement(children)) {
    return <pre>{children}</pre>;
  }

  const codeElement = children;
  const { children: rawCode, className } = codeElement.props as { children: React.ReactNode, className?: string };
  const finalCodeString = (Array.isArray(rawCode) ? rawCode.join('') : String(rawCode)).replace(/\n$/, '');
  const language = className?.replace('language-', '') || 'text';

  const handleCopy = () => {
    navigator.clipboard.writeText(finalCodeString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }, (err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="relative group bg-black/30 rounded-lg my-4 text-sm font-mono">
      <div className="flex items-center justify-between bg-black/20 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <span className="text-gray-400 font-sans">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-sans text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          aria-label="Copy code to clipboard"
        >
          {isCopied ? (
            <>
              <Icon as="check" className="h-3 w-3 text-green-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Icon as="copy" className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
        }}
        codeTagProps={{
            style: {
                fontFamily: 'inherit',
                fontSize: 'inherit',
            },
        }}
      >
        {finalCodeString}
      </SyntaxHighlighter>
    </div>
  );
};
