
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  isVip?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  joinedAt?: Date;
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
