
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// User type definitions
export type UserRole = 'standard' | 'vip' | 'admin';

export interface UserProfile {
  username: string;
  age?: number;
  gender?: string;
  interests?: string[];
  location?: string;
  isOnline?: boolean;
  lastActive?: Date;
  role: UserRole;
  avatarUrl?: string;
  avatar?: string;
  isVip?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  joinedAt?: Date;
  email?: string;
  isBanned?: boolean;
  banExpiresAt?: Date;
  isBot?: boolean;
  tempVipExpiresAt?: Date;
  isVisible?: boolean; // Admin visibility toggle
  phoneNumber?: string; // For admin contact
}

export interface BannedUser {
  username: string;
  userId: number;
  banReason?: string;
  bannedAt: Date;
  banExpiresAt?: Date;
  bannedBy: string;
  ipAddress?: string;
}

export interface AdminSettings {
  isVisible: boolean;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

interface UserContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  rulesAccepted: boolean;
  setRulesAccepted: (status: boolean) => void;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  bannedUsers: BannedUser[];
  setBannedUsers: (users: BannedUser[]) => void;
  addBannedUser: (user: BannedUser) => void;
  removeBannedUser: (userId: number) => void;
  adminSettings: AdminSettings;
  setAdminSettings: (settings: AdminSettings) => void;
  toggleAdminVisibility: () => void;
  setTempVipStatus: (userId: number, username: string, expiryDate: Date) => void;
  upgradeToVip: (userId: number, username: string, isPermanent: boolean, expiryDate?: Date) => void;
  kickUser: (userId: number) => void;
  isAdminLoggedIn: () => boolean;
}

const defaultValue: UserContextType = {
  currentUser: null,
  setCurrentUser: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  rulesAccepted: false,
  setRulesAccepted: () => {},
  userRole: null,
  setUserRole: () => {},
  bannedUsers: [],
  setBannedUsers: () => {},
  addBannedUser: () => {},
  removeBannedUser: () => {},
  adminSettings: { isVisible: true, email: 'admin@chatwii.com' },
  setAdminSettings: () => {},
  toggleAdminVisibility: () => {},
  setTempVipStatus: () => {},
  upgradeToVip: () => {},
  kickUser: () => {},
  isAdminLoggedIn: () => false,
};

export const UserContext = createContext<UserContextType>(defaultValue);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
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

  // Update userRole when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
      
      // Save admin login status to localStorage if admin
      if (currentUser.role === 'admin') {
        localStorage.setItem('adminLoggedIn', 'true');
      }
    } else {
      setUserRole(null);
    }
  }, [currentUser]);

  // Check for admin login status on mount
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (adminLoggedIn && !currentUser) {
      // Auto-restore admin session on refresh
      setCurrentUser({
        username: 'Admin',
        role: 'admin',
        isAdmin: true,
        isOnline: true,
        isVisible: adminSettings.isVisible,
      });
      setIsLoggedIn(true);
    }
  }, []);

  const addBannedUser = (user: BannedUser) => {
    setBannedUsers(prev => [...prev, user]);
  };

  const removeBannedUser = (userId: number) => {
    setBannedUsers(prev => prev.filter(user => user.userId !== userId));
  };

  const toggleAdminVisibility = () => {
    setAdminSettings(prev => {
      const updated = { ...prev, isVisible: !prev.isVisible };
      
      // Also update current user if it's the admin
      if (currentUser?.role === 'admin') {
        setCurrentUser(prev => prev ? { ...prev, isVisible: updated.isVisible } : null);
      }
      
      return updated;
    });
  };

  const setTempVipStatus = (userId: number, username: string, expiryDate: Date) => {
    // In a real app, this would update the database
    console.log(`User ${username} (ID: ${userId}) granted temporary VIP status until ${expiryDate.toLocaleString()}`);
    
    // Simulate updating the user's status
    localStorage.setItem(`tempVip_${userId}`, JSON.stringify({
      username,
      expiryDate: expiryDate.toISOString(),
    }));
  };

  const upgradeToVip = (userId: number, username: string, isPermanent: boolean, expiryDate?: Date) => {
    // In a real app, this would update the database
    if (isPermanent) {
      console.log(`User ${username} (ID: ${userId}) upgraded to permanent VIP status`);
    } else if (expiryDate) {
      console.log(`User ${username} (ID: ${userId}) upgraded to VIP status until ${expiryDate.toLocaleString()}`);
    }
    
    // Simulate updating the user's status
    localStorage.setItem(`vipStatus_${userId}`, JSON.stringify({
      username,
      isPermanent,
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
    }));
  };

  const kickUser = (userId: number) => {
    // In a real app, this would disconnect the user
    console.log(`User with ID: ${userId} has been kicked from the chat`);
    // Simulate disconnecting by setting a session flag
    sessionStorage.setItem(`kicked_${userId}`, 'true');
  };

  const isAdminLoggedIn = () => {
    return currentUser?.role === 'admin' || localStorage.getItem('adminLoggedIn') === 'true';
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        setIsLoggedIn,
        rulesAccepted,
        setRulesAccepted,
        userRole,
        setUserRole,
        bannedUsers,
        setBannedUsers,
        addBannedUser,
        removeBannedUser,
        adminSettings,
        setAdminSettings,
        toggleAdminVisibility,
        setTempVipStatus,
        upgradeToVip,
        kickUser,
        isAdminLoggedIn,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
