
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
    } else {
      setUserRole(null);
    }
  }, [currentUser]);

  const addBannedUser = (user: BannedUser) => {
    setBannedUsers(prev => [...prev, user]);
  };

  const removeBannedUser = (userId: number) => {
    setBannedUsers(prev => prev.filter(user => user.userId !== userId));
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
