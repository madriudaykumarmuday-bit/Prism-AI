import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { UserProfile, Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onUpdateProfile }) => {
  const [language, setLanguage] = useState<Language>(user.settings?.language || 'English');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(user.settings?.theme || 'system');

  useEffect(() => {
    if (isOpen) {
      setLanguage(user.settings?.language || 'English');
      setTheme(user.settings?.theme || 'system');
    }
  }, [isOpen, user.settings]);

  const handleSave = () => {
    const updatedProfile: UserProfile = {
      ...user,
      settings: {
        language,
        theme,
      },
    };
    onUpdateProfile(updatedProfile);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="p-6 space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">AI Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Select the default language for the AI's responses.</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-2 text-sm rounded-md border-2 transition-colors ${
                  theme === t ? 'border-cyan-500 bg-cyan-500/20' : 'border-transparent bg-black/20 hover:bg-black/40'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Choose how Prism AI looks. (Note: Visual theme change is a future feature).</p>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-cyan-600 rounded-md hover:bg-cyan-700">Save</button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
