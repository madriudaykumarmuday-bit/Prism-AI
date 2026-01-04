import React, { useState, useEffect, useMemo } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { useChat } from './hooks/useChat';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Header } from './components/Header';
import { Language, UserProfile, Conversation } from './types';
import LoginPage from './components/LoginPage';
import { Footer } from './components/Footer';
import { addOrUpdateUser, getUser, getConversations, deleteConversation } from './services/apiService';
import { Sidebar } from './components/Sidebar';
import { DictionaryPanel } from './components/DictionaryPanel';
import SettingsModal from './components/SettingsModal';

const SESSION_KEY = 'prism-ai-session-userid';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [language, setLanguage] = useState<Language>('English');
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isDictionaryVisible, setIsDictionaryVisible] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.settings?.language) {
      setLanguage(user.settings.language);
    }
    // Future: Add logic to apply theme from user.settings.theme
  }, [user?.settings]);

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const { messages, setMessages, sendMessage, isLoading, error } = useChat({
    language,
    user: user!,
    activeConversation,
    onConversationUpdate: (updatedConversation) => {
        setConversations(prev => {
            const exists = prev.some(c => c.id === updatedConversation.id);
            let newConversations = exists
                ? prev.map(c => c.id === updatedConversation.id ? updatedConversation : c)
                : [updatedConversation, ...prev];
            
            newConversations.sort((a, b) => b.lastUpdated - a.lastUpdated);
            return newConversations;
        });
        setActiveConversationId(updatedConversation.id);
    }
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userId = localStorage.getItem(SESSION_KEY);
        if (userId) {
          const storedUser = await getUser(userId);
          if (storedUser) {
            setUser(storedUser);
            const userConversations = await getConversations(storedUser.id);
            setConversations(userConversations);
            if (userConversations.length > 0) {
              setActiveConversationId(userConversations[0].id);
            }
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch (e) {
        console.error("Failed to check session:", e);
      } finally {
        setAuthChecked(true);
      }
    };
    checkSession();
  }, []);

  // ✅ Fixed: allow undefined for second param
  const handleSend = (text: string, attachment?: File | null) => {
    sendMessage(text, attachment ?? null, isWebSearchEnabled);
  };

  const handleLogin = async (profile: UserProfile) => {
    try {
      const existingUser = await getUser(profile.id);
      const profileToSave: UserProfile = {
        ...profile,
        settings: existingUser?.settings || { language: 'English', theme: 'system' }
      };

      await addOrUpdateUser(profileToSave);
      setUser(profileToSave);
      localStorage.setItem(SESSION_KEY, profileToSave.id);
      const userConversations = await getConversations(profileToSave.id);
      setConversations(userConversations);
      if (userConversations.length > 0) {
        setActiveConversationId(userConversations[0].id);
      } else {
        setActiveConversationId(null);
      }
    } catch (e) {
      console.error("Failed to login:", e);
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    setConversations([]);
    setActiveConversationId(null);
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    try {
        await addOrUpdateUser(updatedProfile);
        setUser(updatedProfile);
    } catch (e) {
        console.error("Failed to update profile:", e);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    const newConversations = conversations.filter(c => c.id !== id);
    setConversations(newConversations);
    if (activeConversationId === id) {
        setActiveConversationId(newConversations.length > 0 ? newConversations[0].id : null);
    }
  };

  if (!authChecked) {
    return <div className="h-screen w-screen bg-transparent"></div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const learningContext = activeConversation?.messages.slice().reverse().find(m => m.role === 'model')?.content || '';

  return (
    <div className="flex h-screen text-white font-sans">
      {isSidebarVisible && (
        <Sidebar 
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}
      <div className="flex flex-col flex-grow min-w-0">
        <Header 
          user={user}
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
          currentLanguage={language} 
          onLanguageChange={setLanguage} 
          learningContext={learningContext}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={() => setIsSidebarVisible(prev => !prev)}
          isDictionaryVisible={isDictionaryVisible}
          onToggleDictionary={() => setIsDictionaryVisible(prev => !prev)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
        <main className="flex-grow flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <WelcomeScreen sendMessage={handleSend} />
          ) : (
            <ChatWindow messages={messages} isLoading={isLoading} />
          )}
          <div className="p-4 md:p-6 w-full max-w-4xl mx-auto flex-shrink-0">
            <MessageInput 
              onSend={handleSend} 
              disabled={isLoading}
              isWebSearchEnabled={isWebSearchEnabled}
              onWebSearchToggle={() => setIsWebSearchEnabled(prev => !prev)}
              language={language}
            />
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>
        </main>
        <Footer />
      </div>
      {isDictionaryVisible && <DictionaryPanel language={language} />}
      {isSettingsModalOpen && (
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            user={user}
            onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default App;
