import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { CodeBlock } from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { executePythonCode, debugCode, explainCode } from '../services/geminiService';

interface CodeRunnerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Language = 'javascript' | 'python' | 'html';
type OutputTab = 'execute' | 'debug' | 'explain';

const languagePlaceholders: Record<Language, string> = {
    javascript: `// JavaScript code goes here\nconsole.log('Hello, from JavaScript!');`,
    python: `# Python code goes here\nprint("Hello, from Python!")`,
    html: `<!-- HTML, CSS, and JS -->\n<style>\n  body { \n    font-family: sans-serif; \n    background-color: #f0f0f0;\n    display: grid;\n    place-content: center;\n    height: 100vh;\n    margin: 0;\n  }\n  h1 { color: #333; }\n</style>\n\n<h1>Hello, from HTML!</h1>\n\n<script>\n  document.querySelector('h1').addEventListener('click', () => {\n    alert('Clicked!');\n  });\n</script>`,
};

const CodeRunner: React.FC<CodeRunnerProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState<Language>('javascript');
  const [code, setCode] = useState<string>(languagePlaceholders.javascript);
  const [outputs, setOutputs] = useState({ execute: '', debug: '', explain: '' });
  const [activeTab, setActiveTab] = useState<OutputTab>('execute');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset to placeholder when modal opens or language changes
    if (isOpen) {
      setCode(languagePlaceholders[language]);
      setOutputs({ execute: '', debug: '', explain: '' });
      setError(null);
      setActiveTab('execute');
    }
  }, [isOpen, language]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };
  
  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setActiveTab('execute');

    try {
        let result = '';
        if (language === 'javascript') {
            let logs: string[] = [];
            const oldLog = console.log;
            console.log = (...args) => { logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')); oldLog.apply(console, args); };
            try {
                const funcResult = new Function(code)();
                if (funcResult !== undefined) {
                    logs.push(`Return Value: ${JSON.stringify(funcResult)}`);
                }
            } catch (e: any) {
                logs.push(`Error: ${e.message}`);
            } finally {
                console.log = oldLog;
            }
            result = logs.join('\n');

        } else if (language === 'python') {
            result = await executePythonCode(code);
        } else if (language === 'html') {
             result = `data:text/html;charset=utf-8,${encodeURIComponent(code)}`;
        }
        setOutputs(prev => ({...prev, execute: result}));
    } catch (err) {
        setError(err instanceof Error ? err.message : "Execution failed.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDebug = async () => {
    setIsLoading(true);
    setError(null);
    setActiveTab('debug');
     try {
        const result = await debugCode(code, language);
        setOutputs(prev => ({...prev, debug: result}));
    } catch (err) {
        setError(err instanceof Error ? err.message : "Debugging failed.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleExplain = async () => {
    setIsLoading(true);
    setError(null);
    setActiveTab('explain');
     try {
        const result = await explainCode(code, language);
        setOutputs(prev => ({...prev, explain: result}));
    } catch (err) {
        setError(err instanceof Error ? err.message : "Explanation failed.");
    } finally {
        setIsLoading(false);
    }
  };

  const renderOutput = () => {
    const outputContent = outputs[activeTab];
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader /></div>;
    }
    if (activeTab === 'execute' && language === 'html') {
         return outputContent ? <iframe src={outputContent} className="w-full h-full bg-white rounded-md" title="HTML Output"/> : <p className="text-gray-400 text-sm p-4">Click 'Execute' to see the HTML output.</p>;
    }
    if (activeTab === 'execute') {
        return <pre className="text-sm whitespace-pre-wrap text-gray-200 p-4">{outputContent || "Click 'Execute' to run the code."}</pre>
    }
    
    const placeholder = activeTab === 'debug' 
        ? "Click 'Debug' to analyze the code for issues." 
        : "Click 'Explain' to get a detailed explanation of the code.";

    return (
        <div className="p-4 prose prose-invert prose-p:my-2 prose-headings:my-3 max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    pre: CodeBlock
                }}
            >
                {outputContent || placeholder}
            </ReactMarkdown>
        </div>
    );
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Code Runner" maxWidth="max-w-4xl">
      <div className="flex flex-col h-[80vh]">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-300">Language:</span>
                {(['javascript', 'python', 'html'] as Language[]).map(lang => (
                    <button key={lang} onClick={() => handleLanguageChange(lang)} className={`px-3 py-1 text-xs rounded-full transition-colors ${language === lang ? 'bg-cyan-500 text-white font-semibold' : 'bg-gray-600 hover:bg-gray-500'}`}>
                        {lang === 'html' ? 'HTML/CSS/JS' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex-1 p-4 grid grid-rows-2 gap-4 overflow-hidden">
            <div className="flex flex-col bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-transparent p-3 text-sm font-mono text-gray-200 resize-none focus:outline-none"
                    placeholder="Enter your code here..."
                />
            </div>
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center space-x-2 mb-2 flex-shrink-0">
                    <button onClick={handleExecute} disabled={isLoading} className="bg-green-600 text-white rounded-md px-4 py-2 text-sm hover:bg-green-700 disabled:bg-gray-600 flex-1">Execute</button>
                    <button onClick={handleDebug} disabled={isLoading} className="bg-yellow-600 text-white rounded-md px-4 py-2 text-sm hover:bg-yellow-700 disabled:bg-gray-600 flex-1">Debug</button>
                    <button onClick={handleExplain} disabled={isLoading} className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 disabled:bg-gray-600 flex-1">Explain</button>
                </div>
                {error && <p className="text-center text-xs text-red-400 bg-red-900/50 p-2 rounded-md mb-2 flex-shrink-0">{error}</p>}
                <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-700 overflow-auto">
                    {renderOutput()}
                </div>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default CodeRunner;