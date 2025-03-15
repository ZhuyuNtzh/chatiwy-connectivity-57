
import { useState, useEffect } from 'react';
import { BannedUser, AdminSettings } from '@/types/user';

export const useAdminFeatures = () => {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    isVisible: true,
    email: 'admin@chatwii.com',
  });

  // Load admin settings from localStorage on component mount
  useEffect(() => {
    const storedAdminSettings = localStorage.getItem('adminSettings');
    if (storedAdminSettings) {
      try {
        const parsedSettings = JSON.parse(storedAdminSettings);
        setAdminSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing admin settings from localStorage:', error);
      }
    }
  }, []);

  // Save admin settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  // Load banned users from localStorage on component mount
  useEffect(() => {
    const storedBannedUsers = localStorage.getItem('bannedUsers');
    if (storedBannedUsers) {
      try {
        const parsedUsers = JSON.parse(storedBannedUsers);
        setBannedUsers(parsedUsers);
      } catch (error) {
        console.error('Error parsing banned users from localStorage:', error);
      }
    }
  }, []);

  // Save banned users to localStorage when they change
  useEffect(() => {
    if (bannedUsers.length > 0) {
      localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    }
  }, [bannedUsers]);

  const addBannedUser = (user: BannedUser) => {
    setBannedUsers(prev => [...prev, user]);
  };

  const removeBannedUser = (userId: number) => {
    setBannedUsers(prev => prev.filter(user => user.userId !== userId));
  };

  const toggleAdminVisibility = () => {
    setAdminSettings(prev => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  };

  return {
    bannedUsers,
    setBannedUsers,
    addBannedUser, 
    removeBannedUser,
    adminSettings,
    setAdminSettings,
    toggleAdminVisibility
  };
};
