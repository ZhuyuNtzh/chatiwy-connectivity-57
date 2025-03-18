import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAdminFeatures } from '@/hooks/useAdminFeatures';
import { useVipFeatures } from '@/hooks/useVipFeatures';
import { useUserManagement } from '@/hooks/useUserManagement';

export interface UserProfile {
  id?: string; // Add id property
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

export type UserRole = 'standard' | 'vip' | 'admin';

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
  // Admin features
  bannedUsers: ReturnType<typeof useAdminFeatures>['bannedUsers'];
  setBannedUsers: ReturnType<typeof useAdminFeatures>['setBannedUsers'];
  addBannedUser: ReturnType<typeof useAdminFeatures>['addBannedUser'];
  removeBannedUser: ReturnType<typeof useAdminFeatures>['removeBannedUser'];
  adminSettings: ReturnType<typeof useAdminFeatures>['adminSettings'];
  setAdminSettings: ReturnType<typeof useAdminFeatures>['setAdminSettings'];
  toggleAdminVisibility: ReturnType<typeof useAdminFeatures>['toggleAdminVisibility'];
  // VIP features
  setTempVipStatus: ReturnType<typeof useVipFeatures>['setTempVipStatus'];
  upgradeToVip: ReturnType<typeof useVipFeatures>['upgradeToVip'];
  // User management
  kickUser: ReturnType<typeof useUserManagement>['kickUser'];
  isAdminLoggedIn: ReturnType<typeof useUserManagement>['isAdminLoggedIn'];
}

export const UserContext = createContext<UserContextType | null>(null);

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
  
  const adminFeatures = useAdminFeatures();
  const vipFeatures = useVipFeatures();
  const userManagement = useUserManagement();

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
        isVisible: adminFeatures.adminSettings.isVisible,
      });
      setIsLoggedIn(true);
    }
  }, []);

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
        // Admin features
        ...adminFeatures,
        // VIP features
        ...vipFeatures,
        // User management
        ...userManagement,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Export types for convenience
export type { UserProfile, UserRole } from '@/types/user';
export type { BannedUser, AdminSettings } from '@/types/user';
