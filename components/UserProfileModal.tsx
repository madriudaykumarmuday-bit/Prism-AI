
import React, { useRef } from 'react';
import Modal from './Modal';
import { UserProfile } from '../types';
import { Icon } from './Icon';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onUpdateProfile }) => {
  if (!user) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("File is too large. Please select an image smaller than 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const newPicture = reader.result as string;
            const updatedProfile = { ...user, picture: newPicture };
            onUpdateProfile(updatedProfile);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
      <div className="p-6 text-center">
        <div className="relative group w-24 h-24 mx-auto mb-4">
            <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full border-4 border-cyan-500 object-cover" />
            <button
                onClick={handleChangePhotoClick}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Change profile photo"
            >
                <Icon as="pencil" className="w-8 h-8" />
                <span className="sr-only">Change Photo</span>
            </button>
        </div>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
        />
        <h3 className="text-2xl font-bold text-white">{user.name}</h3>
        <p className="text-gray-400 mt-1">{user.email}</p>
        <div className="mt-6 text-left bg-black/20 p-4 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500">User ID</p>
            <p className="text-sm text-gray-300 font-mono break-all">{user.id}</p>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;
