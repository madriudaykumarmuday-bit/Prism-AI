import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { aiTools } from './Header';
import { UserProfile } from '../types';
import { isGeminiConfigured } from '../services/geminiService';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    // For demonstration, login with mock data.
    // In a real app, you would validate this against a backend.
    const mockUserProfile: UserProfile = {
      id: `mock-user-${Date.now()}`,
      name: email.split('@')[0] || 'Demo User',
      email: email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'D U').replace('%20', '+')}&background=0D8ABC&color=fff`,
    };
    onLogin(mockUserProfile);
  };

  const handleGuestLogin = () => {
    const guestProfile: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@example.com',
      picture: `https://ui-avatars.com/api/?name=Guest+User&background=6B7280&color=fff`,
    };
    onLogin(guestProfile);
  };

  const handleGoogleLogin = () => {
    const mockGoogleProfile: UserProfile = {
      id: `google-user-${Date.now()}`,
      name: 'Google User',
      email: 'google.user@example.com',
      picture: `https://ui-avatars.com/api/?name=Google+User&background=DB4437&color=fff`,
    };
    onLogin(mockGoogleProfile);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-12">
            <div className="flex justify-center items-center gap-4 mb-4">
                <Icon as="prism" className="w-16 h-16" />
                <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white">Prism AI</h1>
                    <p className="text-gray-300 mt-2 text-lg">Your All-in-One AI Toolkit</p>
                </div>
            </div>
             {!isGeminiConfigured && (
                <div className="max-w-md mx-auto mt-4 bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg text-sm text-left">
                    <p className="font-bold mb-2">Configuration Error: API Key Missing</p>
                    <p>To use Prism AI, please provide your Google Gemini API key:</p>
                    <ol className="list-decimal list-inside mt-2 text-xs space-y-1">
                        <li>In the project's root directory, create a new file named <code>.env</code></li>
                        <li>Add the following line to this new file:</li>
                    </ol>
                    <pre className="bg-black/50 p-2 rounded-md text-xs mt-2 font-mono"><code>API_KEY=your_gemini_api_key_here</code></pre>
                    <p className="mt-2 text-xs">Replace <code>your_gemini_api_key_here</code> with your actual key, then reload the page.</p>
                </div>
            )}
        </header>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* AI Toolkit Showcase */}
            <div className="w-full md:w-1/2 lg:w-3/5">
                <details open={isToolkitOpen} onToggle={(e) => setIsToolkitOpen(e.currentTarget.open)} className="group bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 transition-all duration-300">
                    <summary className="list-none flex items-center justify-between font-semibold text-white cursor-pointer text-lg">
                    <span>✨ Explore Our {aiTools.length}+ AI Tools</span>
                    <Icon as="chevron-down" className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 max-h-[50vh] overflow-y-auto pr-2">
                    {aiTools.map((feature, index) => (
                        <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10 transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-cyan-900/50 rounded-lg mt-1">
                                <Icon as={feature.icon} className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                            <h3 className="text-md font-semibold text-white">{feature.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">{feature.description}</p>
                            </div>
                        </div>
                        </div>
                    ))}
                    </main>
                </details>
            </div>
            {/* Login Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 max-w-sm">
                <div className={`bg-white/5 backdrop-blur-md p-8 rounded-xl border border-white/10 ${!isGeminiConfigured ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
                    <form onSubmit={handleFormLogin} className="space-y-4">
                        <div className="relative">
                            <Icon as="envelope" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="email" 
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-md py-2.5 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                         <div className="relative">
                            <Icon as="lock-closed" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-md py-2.5 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <button type="submit" className="w-full bg-cyan-600 text-white rounded-md py-2.5 font-semibold hover:bg-cyan-700 transition-colors">
                            Login
                        </button>
                    </form>
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="mx-4 text-xs text-gray-400">OR</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 rounded-md py-2.5 font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <Icon as="google" className="w-5 h-5" />
                            <span>Sign in with Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            className="w-full bg-gray-600 text-white rounded-md py-2.5 font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;