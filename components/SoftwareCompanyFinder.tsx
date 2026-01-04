import React, { useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { getSoftwareCompanyProfile } from '../services/geminiService';
import { SoftwareCompanyProfile } from '../types';
import { Icon } from './Icon';

interface SoftwareCompanyFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

const companyCategories = {
  "Big Tech & Cloud": ["Microsoft", "Google", "Amazon (AWS)", "Apple", "Meta", "Oracle", "IBM"],
  "SaaS & Enterprise": ["Salesforce", "Adobe", "SAP", "ServiceNow", "Intuit", "Workday", "Atlassian", "Zoom", "Slack", "Shopify", "HubSpot", "Snowflake", "Databricks"],
  "Design & Creativity": ["Figma", "Canva", "Autodesk"],
  "Gaming & Entertainment": ["Nvidia", "Unity", "Epic Games", "Roblox"],
  "Cybersecurity": ["Palo Alto Networks", "CrowdStrike", "Fortinet", "Zscaler"],
  "Developer Tools & Open Source": ["GitHub", "GitLab", "HashiCorp", "Docker", "Red Hat"],
  "FinTech": ["Stripe", "PayPal", "Block (Square)"],
  "AI Focused": ["OpenAI", "Anthropic", "Hugging Face", "Scale AI", "Perplexity AI"]
};


const SoftwareCompanyFinder: React.FC<SoftwareCompanyFinderProps> = ({ isOpen, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [profile, setProfile] = useState<SoftwareCompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (nameToSearch: string) => {
    if (!nameToSearch.trim()) {
      setError("Please enter a company name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setProfile(null);
    try {
      const result = await getSoftwareCompanyProfile(nameToSearch);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(companyName);
  };
  
  const handleCompanyClick = (name: string) => {
    setCompanyName(name);
    handleSearch(name);
  };

  const handleBackToList = () => {
    setProfile(null);
    setCompanyName('');
    setError(null);
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Software Company Finder" maxWidth="max-w-4xl">
      <div className="p-6">
        {!profile && !isLoading && (
          <div>
            <p className="text-sm text-gray-400 mb-4">
              Browse the directory or search for any software company to get an AI-generated profile with learning and interview resources.
            </p>
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Microsoft, a new startup..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!companyName.trim()}
                className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 focus:outline-none disabled:bg-gray-600 flex-shrink-0"
              >
                Search
              </button>
            </form>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(companyCategories).map(([category, companies]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {companies.map(company => (
                      <button 
                        key={company} 
                        onClick={() => handleCompanyClick(company)}
                        className="px-3 py-1.5 text-sm bg-gray-700/50 rounded-md hover:bg-cyan-500/30 transition-colors"
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && <div className="flex justify-center pt-10"><Loader /></div>}
        {error && 
          <div className="text-center">
            <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>
            <button onClick={handleBackToList} className="mt-4 text-sm bg-gray-600 text-white py-1 px-3 rounded-md hover:bg-gray-500">Back to list</button>
          </div>
        }
        
        {profile && (
          <div>
             <button onClick={handleBackToList} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Back to Directory</span>
            </button>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-xl font-bold text-cyan-400">{profile.name}</h3>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{profile.website}</a>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white">Overview</h4>
                  <p className="text-gray-300 text-sm mt-1">{profile.overview}</p>
              </div>
               <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white">Key Products & Services</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 text-sm">
                      {profile.keyProducts.map((product, index) => <li key={index}>{product}</li>)}
                  </ul>
              </div>
              {profile.learningResources?.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white">Official Learning Platforms</h4>
                     <ul className="space-y-2 mt-2">
                        {profile.learningResources.map((resource, index) => (
                            <li key={index} className="text-sm">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all flex items-center gap-2" title={resource.url}>
                                    <Icon as="link" className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate font-semibold">{resource.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
              {profile.problemSolvingPlatforms?.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white">Problem-Solving Practice</h4>
                     <ul className="space-y-2 mt-2">
                        {profile.problemSolvingPlatforms.map((resource, index) => (
                            <li key={index} className="text-sm">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all flex items-center gap-2" title={resource.url}>
                                    <Icon as="code-bracket" className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate font-semibold">{resource.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
               {profile.interviewPracticePlatforms?.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white">Interview Practice Platforms</h4>
                     <ul className="space-y-2 mt-2">
                        {profile.interviewPracticePlatforms.map((resource, index) => (
                            <li key={index} className="text-sm">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all flex items-center gap-2" title={resource.url}>
                                    <Icon as="chat-bubble-left-right" className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate font-semibold">{resource.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
               <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white">Recent News</h4>
                  <p className="text-gray-300 text-sm mt-1">{profile.recentNews}</p>
              </div>
              {profile.sources && profile.sources.length > 0 && (
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white">Sources</h4>
                       <ul className="space-y-2 mt-2">
                          {profile.sources.map((source, index) => (
                              <li key={index} className="text-sm">
                                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all flex items-center gap-2" title={source.uri}>
                                      <Icon as="link" className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate">{source.title || source.uri}</span>
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SoftwareCompanyFinder;