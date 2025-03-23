
import React, { createContext, useContext, ReactNode } from 'react';
import { useAdminFeatures } from '@/hooks/useAdminFeatures';
import { useAdminActions } from '@/hooks/useAdminActions';
import { useAdminMonitoring } from '@/hooks/useAdminMonitoring';
import type { ActiveUserStat } from '@/hooks/useAdminMonitoring';

interface AdminContextType {
  // Admin Features (from existing hook)
  adminSettings: ReturnType<typeof useAdminFeatures>['adminSettings'];
  toggleAdminVisibility: ReturnType<typeof useAdminFeatures>['toggleAdminVisibility'];
  
  // Admin Actions
  kickUser: ReturnType<typeof useAdminActions>['kickUser'];
  banUser: ReturnType<typeof useAdminActions>['banUser'];
  upgradeToVIP: ReturnType<typeof useAdminActions>['upgradeToVIP'];
  unbanUser: ReturnType<typeof useAdminActions>['unbanUser'];
  isUserBanned: ReturnType<typeof useAdminActions>['isUserBanned'];
  isUserKicked: ReturnType<typeof useAdminActions>['isUserKicked'];
  isActionInProgress: ReturnType<typeof useAdminActions>['isActionInProgress'];
  logAdminAction: ReturnType<typeof useAdminActions>['logAdminAction'];
  getAdminActionLogs: ReturnType<typeof useAdminActions>['getAdminActionLogs'];
  
  // Admin Monitoring
  activeUsers: ActiveUserStat[];
  messageStats: {
    total: number;
    lastHour: number;
    flaggedCount: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const adminFeatures = useAdminFeatures();
  const adminActions = useAdminActions();
  const { activeUsers, messageStats } = useAdminMonitoring();
  
  return (
    <AdminContext.Provider
      value={{
        // Admin Features
        adminSettings: adminFeatures.adminSettings,
        toggleAdminVisibility: adminFeatures.toggleAdminVisibility,
        
        // Admin Actions
        kickUser: adminActions.kickUser,
        banUser: adminActions.banUser,
        upgradeToVIP: adminActions.upgradeToVIP,
        unbanUser: adminActions.unbanUser,
        isUserBanned: adminActions.isUserBanned,
        isUserKicked: adminActions.isUserKicked,
        isActionInProgress: adminActions.isActionInProgress,
        logAdminAction: adminActions.logAdminAction,
        getAdminActionLogs: adminActions.getAdminActionLogs,
        
        // Admin Monitoring
        activeUsers,
        messageStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
