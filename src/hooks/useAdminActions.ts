
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AdminActionLog {
  id: string;
  action: 'kick' | 'ban' | 'unban' | 'vip_upgrade';
  targetUserId: number;
  targetUsername: string;
  adminId: number;
  adminName: string;
  timestamp: Date;
  reason?: string;
  duration?: string;
  expiresAt?: Date;
}

export const useAdminActions = () => {
  const [actionLogs, setActionLogs] = useState<AdminActionLog[]>([]);
  const [pendingActions, setPendingActions] = useState<Set<number>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<Set<number>>(new Set());
  const [kickedUsers, setKickedUsers] = useState<Map<number, Date>>(new Map());

  // Load action logs from localStorage on component mount
  useEffect(() => {
    const storedLogs = localStorage.getItem('adminActionLogs');
    if (storedLogs) {
      try {
        // Parse dates properly
        const parsedLogs = JSON.parse(storedLogs, (key, value) => {
          if (key === 'timestamp' || key === 'expiresAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setActionLogs(parsedLogs);
        
        // Setup initial banned and kicked users
        const bannedIds = new Set<number>();
        const kickedMap = new Map<number, Date>();
        
        parsedLogs.forEach((log: AdminActionLog) => {
          if (log.action === 'ban') {
            bannedIds.add(log.targetUserId);
          } else if (log.action === 'unban') {
            bannedIds.delete(log.targetUserId);
          } else if (log.action === 'kick' && log.expiresAt && new Date(log.expiresAt) > new Date()) {
            kickedMap.set(log.targetUserId, new Date(log.expiresAt));
          }
        });
        
        setBannedUsers(bannedIds);
        setKickedUsers(kickedMap);
      } catch (error) {
        console.error('Error parsing admin action logs from localStorage:', error);
      }
    }
  }, []);

  // Periodically check and clean up expired kicked users
  useEffect(() => {
    const checkExpiredKicks = () => {
      const now = new Date();
      const expired: number[] = [];
      
      kickedUsers.forEach((expiresAt, userId) => {
        if (expiresAt <= now) {
          expired.push(userId);
        }
      });
      
      if (expired.length > 0) {
        const newKickedUsers = new Map(kickedUsers);
        expired.forEach(userId => newKickedUsers.delete(userId));
        setKickedUsers(newKickedUsers);
      }
    };
    
    const interval = setInterval(checkExpiredKicks, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [kickedUsers]);

  // Save action logs to localStorage when they change
  useEffect(() => {
    if (actionLogs.length > 0) {
      localStorage.setItem('adminActionLogs', JSON.stringify(actionLogs));
    }
  }, [actionLogs]);

  const generateLogId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const logAdminAction = (actionLog: Omit<AdminActionLog, 'id'>) => {
    const newLog = {
      ...actionLog,
      id: generateLogId()
    };
    
    setActionLogs(prevLogs => [newLog, ...prevLogs]);
    return newLog.id;
  };

  const kickUser = async (userId: number): Promise<boolean> => {
    if (pendingActions.has(userId)) {
      toast.error('Action already in progress for this user');
      return false;
    }
    
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      
      // In a real implementation, this would make an API call
      // Mock implementation with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set kick expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Get username from mock data
      const username = `User${userId}`;
      
      // Log the action
      logAdminAction({
        action: 'kick',
        targetUserId: userId,
        targetUsername: username,
        adminId: 999, // Mock admin ID
        adminName: 'Admin',
        timestamp: new Date(),
        duration: '24 hours',
        expiresAt
      });
      
      // Update kicked users
      setKickedUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, expiresAt);
        return newMap;
      });
      
      return true;
    } catch (error) {
      console.error('Error kicking user:', error);
      return false;
    } finally {
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const banUser = async (userId: number, reason: string): Promise<boolean> => {
    if (pendingActions.has(userId)) {
      toast.error('Action already in progress for this user');
      return false;
    }
    
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      
      // In a real implementation, this would make an API call
      // Mock implementation with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get username from mock data
      const username = `User${userId}`;
      
      // Log the action
      logAdminAction({
        action: 'ban',
        targetUserId: userId,
        targetUsername: username,
        adminId: 999, // Mock admin ID
        adminName: 'Admin',
        timestamp: new Date(),
        reason
      });
      
      // Update banned users
      setBannedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
      
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      return false;
    } finally {
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const unbanUser = async (userId: number): Promise<boolean> => {
    if (pendingActions.has(userId)) {
      toast.error('Action already in progress for this user');
      return false;
    }
    
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      
      // In a real implementation, this would make an API call
      // Mock implementation with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get username from mock data
      const username = `User${userId}`;
      
      // Log the action
      logAdminAction({
        action: 'unban',
        targetUserId: userId,
        targetUsername: username,
        adminId: 999, // Mock admin ID
        adminName: 'Admin',
        timestamp: new Date()
      });
      
      // Update banned users
      setBannedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      
      return true;
    } catch (error) {
      console.error('Error unbanning user:', error);
      return false;
    } finally {
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const upgradeToVIP = async (userId: number, duration: 'monthly' | 'yearly'): Promise<boolean> => {
    if (pendingActions.has(userId)) {
      toast.error('Action already in progress for this user');
      return false;
    }
    
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      
      // In a real implementation, this would make an API call
      // Mock implementation with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate expiration date
      const expiresAt = new Date();
      if (duration === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
      
      // Get username from mock data
      const username = `User${userId}`;
      
      // Log the action
      logAdminAction({
        action: 'vip_upgrade',
        targetUserId: userId,
        targetUsername: username,
        adminId: 999, // Mock admin ID
        adminName: 'Admin',
        timestamp: new Date(),
        duration,
        expiresAt
      });
      
      return true;
    } catch (error) {
      console.error('Error upgrading user to VIP:', error);
      return false;
    } finally {
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const isUserBanned = (userId: number): boolean => {
    return bannedUsers.has(userId);
  };

  const isUserKicked = (userId: number): boolean => {
    if (!kickedUsers.has(userId)) {
      return false;
    }
    
    const expiresAt = kickedUsers.get(userId);
    return expiresAt ? expiresAt > new Date() : false;
  };

  const getAdminActionLogs = (): AdminActionLog[] => {
    return actionLogs;
  };

  const isActionInProgress = (userId: number): boolean => {
    return pendingActions.has(userId);
  };

  return {
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    isUserBanned,
    isUserKicked,
    isActionInProgress,
    logAdminAction,
    getAdminActionLogs
  };
};
