import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { generateTravelItinerary } from '../services/geminiService';
import { TravelItinerary } from '../types';
import { Icon } from './Icon';

interface TravelPlannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TravelPlanner: React.FC<TravelPlannerProps> = ({ isOpen, onClose }) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState<number>(3);
  const [itinerary, setItinerary] = useState<TravelItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    if (duration < 1 || duration > 14) {
      setError("Please enter a trip duration between 1 and 14 days.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    try {
      const result = await generateTravelItinerary(destination, duration);
      setItinerary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const generateFileContent = (format: 'txt' | 'md' | 'json'): { content: string; mimeType: string; extension: string } => {
    if (!itinerary) return { content: '', mimeType: '', extension: '' };

    const title = `Travel Itinerary: ${itinerary.duration}-day trip to ${itinerary.destination}`;

    switch (format) {
      case 'json':
        return {
          content: JSON.stringify(itinerary, null, 2),
          mimeType: 'application/json;charset=utf-8',
          extension: 'json',
        };
      case 'md':
        const mdContent = `# ${title}\n\n${itinerary.plan.map(day => 
          `## Day ${day.day}: ${day.theme}\n\n${day.activities.map(act => `- ${act}`).join('\n')}`
        ).join('\n\n')}`;
        return {
          content: mdContent,
          mimeType: 'text/markdown;charset=utf-8',
          extension: 'md',
        };
      case 'txt':
      default:
        const txtContent = `${title}\n\n${'='.repeat(title.length)}\n\n${itinerary.plan.map(day => 
          `Day ${day.day}: ${day.theme}\n${day.activities.map(act => `  - ${act}`).join('\n')}`
        ).join('\n\n')}`;
        return {
          content: txtContent,
          mimeType: 'text/plain;charset=utf-8',
          extension: 'txt',
        };
    }
  };

  const handleDownload = (format: 'txt' | 'md' | 'json') => {
    const { content, mimeType, extension } = generateFileContent(format);
    if (!content) return;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary_${destination.replace(/\s/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloadMenuOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Trip Planner">
      <div className="p-6">
        <p className="text-sm text-gray-400 mb-4">
          Enter a destination and trip duration, and the AI will generate a day-by-day itinerary for you.
        </p>
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 mb-6">
          <div className="flex-grow">
            <label htmlFor="destination" className="text-xs font-semibold text-gray-400">Destination</label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, France"
              className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="duration" className="text-xs font-semibold text-gray-400">Duration (Days)</label>
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              min="1"
              max="14"
              className="w-24 mt-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !destination.trim()}
            className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex-shrink-0"
          >
            {isLoading ? <Loader /> : 'Plan Trip'}
          </button>
        </form>

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {itinerary && (
          <div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <h3 className="text-xl font-bold text-cyan-400 border-b border-gray-600 pb-2">{itinerary.duration}-Day Trip to {itinerary.destination}</h3>
              {itinerary.plan.map((day) => (
                <div key={day.day} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-white">Day {day.day}: {day.theme}</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 text-sm">
                    {day.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="relative mt-6">
              <button
                onClick={() => setIsDownloadMenuOpen(prev => !prev)}
                className="w-full text-sm bg-gray-700 text-cyan-300 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-600 flex items-center justify-center space-x-2"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download Itinerary</span>
              </button>
              {isDownloadMenuOpen && (
                <div ref={downloadMenuRef} className="absolute bottom-full mb-2 w-full bg-gray-600 border border-gray-500 rounded-md shadow-lg z-10">
                  <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 rounded-t-md">As Plain Text (.txt)</button>

                  <button onClick={() => handleDownload('md')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500">As Markdown (.md)</button>
                  <button onClick={() => handleDownload('json')} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-500 rounded-b-md">As JSON (.json)</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TravelPlanner;
