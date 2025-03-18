import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAdminFeatures } from '@/hooks/useAdminFeatures';
import { useVipFeatures } from '@/hooks/useVipFeatures';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserProfile, UserRole, BannedUser, AdminSettings } from '@/types/user';

export interface UserContextType {
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

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
      
      if (currentUser.role === 'admin') {
        localStorage.setItem('adminLoggedIn', 'true');
      }
    } else {
      setUserRole(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (adminLoggedIn && !currentUser) {
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
        ...adminFeatures,
        ...vipFeatures,
        ...userManagement,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export * from '@/types/user';
