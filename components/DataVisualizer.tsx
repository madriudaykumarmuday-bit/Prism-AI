import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { Icon } from './Icon';
import { generateVisualizationSpec } from '../services/geminiService';
import { VegaLiteSpec } from '../types';

// Declare the vegaEmbed function that comes from the CDN script
declare var vegaEmbed: any;

interface DataVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const placeholderData = `month,sales,category
Jan,28,A
Feb,55,A
Mar,43,A
Apr,91,A
May,81,A
Jun,53,A
Jul,19,B
Aug,87,B
Sep,52,B
Oct,48,B
Nov,29,B
Dec,98,B`;

const VegaChart: React.FC<{ spec: VegaLiteSpec }> = ({ spec }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chartRef.current && spec) {
            vegaEmbed(chartRef.current, spec, { actions: false }).catch(console.error);
        }
    }, [spec]);

    return <div ref={chartRef} className="w-full h-full bg-white/90 rounded-lg p-2"></div>;
};

const DataVisualizer: React.FC<DataVisualizerProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState(placeholderData);
  const [prompt, setPrompt] = useState('Create a bar chart of sales by month, color-coded by category.');
  const [spec, setSpec] = useState<VegaLiteSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim() || !prompt.trim()) {
      setError("Please provide both data and a visualization prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSpec(null);
    try {
      const result = await generateVisualizationSpec(data, prompt);
      setSpec(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopySpec = () => {
    if (!spec) return;
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2)).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        console.error("Failed to copy spec: ", err);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Data Visualizer" maxWidth="max-w-6xl">
        <div className="flex flex-col md:flex-row h-[85vh]">
            {/* Controls Panel */}
            <div className="w-full md:w-1/3 p-4 border-r border-white/10 flex flex-col space-y-4">
                <div>
                    <label className="text-sm font-semibold text-gray-300 mb-1 block">1. Paste your data (CSV)</label>
                    <textarea
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        placeholder="category,value\nA,28\nB,55..."
                        rows={10}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm font-mono"
                        disabled={isLoading}
                    />
                </div>
                 <div>
                    <label className="text-sm font-semibold text-gray-300 mb-1 block">2. Describe the chart you want</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A bar chart of value by category"
                        rows={3}
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm"
                        disabled={isLoading}
                    />
                </div>
                 <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim() || !data.trim()}
                    className="w-full bg-cyan-500 text-white rounded-md px-4 py-2.5 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex justify-center items-center"
                >
                    {isLoading ? <Loader /> : 'Generate Chart'}
                </button>
                 {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-2">{error}</p>}
            </div>

            {/* Output Panel */}
            <div className="w-full md:w-2/3 p-4 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-200 mb-2 flex-shrink-0">Visualization</h3>
                <div className="flex-grow min-h-0">
                    {spec ? (
                        <VegaChart spec={spec} />
                    ) : (
                        <div className="w-full h-full bg-black/20 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-gray-500">
                            {isLoading ? <Loader/> : <p>Your chart will appear here</p>}
                        </div>
                    )}
                </div>
                {spec && (
                    <div className="mt-4 flex-shrink-0">
                        <div className="flex justify-between items-center mb-1">
                             <h4 className="text-sm font-semibold text-gray-300">Generated Vega-Lite Spec (JSON)</h4>
                             <button onClick={handleCopySpec} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5">
                                {isCopied ? <><Icon as="check" className="w-4 h-4 text-green-400"/> Copied!</> : <><Icon as="copy" className="w-4 h-4"/> Copy</>}
                             </button>
                        </div>
                        <pre className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs font-mono max-h-32 overflow-auto">
                            {JSON.stringify(spec, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default DataVisualizer;