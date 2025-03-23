
import { useState } from 'react';
import { toast } from 'sonner';
import { BannedUser, UserProfile } from '@/types/user';
import { signalRService } from '@/services/signalRService';

export const useAdminActions = () => {
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Kick a user from the chat
  const kickUser = async (userId: number, username: string) => {
    setIsActionInProgress(true);
    try {
      console.log(`Admin action: Kicking user ${username} (ID: ${userId})`);
      
      // In a real app, this would make an API call
      // For now, we'll use sessionStorage to simulate the kicked state
      sessionStorage.setItem(`kicked_${userId}`, 'true');
      sessionStorage.setItem(`kicked_${userId}_until`, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      
      // Log the admin action
      logAdminAction({
        action: 'kick',
        targetUserId: userId,
        targetUsername: username,
        timestamp: new Date(),
        duration: '24 hours'
      });
      
      toast.success(`${username} has been kicked for 24 hours`);
      return { success: true, message: `${username} has been kicked for 24 hours` };
    } catch (error) {
      console.error('Error kicking user:', error);
      toast.error(`Failed to kick ${username}`);
      return { success: false, message: `Failed to kick ${username}` };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Ban a user permanently
  const banUser = async (userId: number, username: string, reason: string): Promise<{success: boolean, message: string}> => {
    setIsActionInProgress(true);
    try {
      console.log(`Admin action: Banning user ${username} (ID: ${userId}). Reason: ${reason}`);
      
      // Create a new banned user entry
      const bannedUser: BannedUser = {
        userId,
        username,
        banReason: reason,
        bannedAt: new Date(),
        bannedBy: 'admin'
      };
      
      // In a real app, this would make an API call
      // For now, we'll use localStorage to persist the banned status
      const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
      bannedUsers.push(bannedUser);
      localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
      
      // Update the signalR blocked users
      signalRService.blockUser(userId);
      
      // Log the admin action
      logAdminAction({
        action: 'ban',
        targetUserId: userId,
        targetUsername: username,
        timestamp: new Date(),
        reason
      });
      
      toast.success(`${username} has been banned permanently`);
      return { success: true, message: `${username} has been banned permanently` };
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error(`Failed to ban ${username}`);
      return { success: false, message: `Failed to ban ${username}` };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Upgrade a user to VIP
  const upgradeToVIP = async (
    userId: number, 
    username: string, 
    duration: 'monthly' | 'yearly'
  ): Promise<{success: boolean, message: string}> => {
    setIsActionInProgress(true);
    try {
      // Calculate expiration date
      const expirationDate = new Date();
      if (duration === 'monthly') {
        expirationDate.setMonth(expirationDate.getMonth() + 1);
      } else {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      }
      
      console.log(`Admin action: Upgrading ${username} (ID: ${userId}) to VIP until ${expirationDate.toISOString()}`);
      
      // In a real app, this would make an API call
      // For now, use localStorage to simulate VIP status
      localStorage.setItem(`vipStatus_${userId}`, JSON.stringify({
        username,
        isPermanent: false,
        expiryDate: expirationDate.toISOString()
      }));
      
      // Log the admin action
      logAdminAction({
        action: 'vip_upgrade',
        targetUserId: userId,
        targetUsername: username,
        timestamp: new Date(),
        duration,
        expiresAt: expirationDate
      });
      
      toast.success(`${username} has been upgraded to VIP until ${expirationDate.toLocaleDateString()}`);
      return { 
        success: true, 
        message: `${username} has been upgraded to VIP until ${expirationDate.toLocaleDateString()}` 
      };
    } catch (error) {
      console.error('Error upgrading user to VIP:', error);
      toast.error(`Failed to upgrade ${username} to VIP`);
      return { success: false, message: `Failed to upgrade ${username} to VIP` };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Unban a user
  const unbanUser = async (userId: number, username: string): Promise<{success: boolean, message: string}> => {
    setIsActionInProgress(true);
    try {
      console.log(`Admin action: Unbanning user ${username} (ID: ${userId})`);
      
      // In a real app, this would make an API call
      // For now, we'll update the bannedUsers in localStorage
      const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
      const updatedBannedUsers = bannedUsers.filter((user: BannedUser) => user.userId !== userId);
      localStorage.setItem('bannedUsers', JSON.stringify(updatedBannedUsers));
      
      // Update the signalR blocked users
      signalRService.unblockUser(userId);
      
      // Log the admin action
      logAdminAction({
        action: 'unban',
        targetUserId: userId,
        targetUsername: username,
        timestamp: new Date()
      });
      
      toast.success(`${username} has been unbanned`);
      return { success: true, message: `${username} has been unbanned` };
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error(`Failed to unban ${username}`);
      return { success: false, message: `Failed to unban ${username}` };
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Check if a user is banned
  const isUserBanned = (userId: number): boolean => {
    try {
      const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
      return bannedUsers.some((user: BannedUser) => user.userId === userId);
    } catch (error) {
      console.error('Error checking if user is banned:', error);
      return false;
    }
  };

  // Check if a user is kicked
  const isUserKicked = (userId: number): boolean => {
    try {
      const kicked = sessionStorage.getItem(`kicked_${userId}`);
      if (!kicked) return false;
      
      const kickedUntil = sessionStorage.getItem(`kicked_${userId}_until`);
      if (kickedUntil) {
        const expiryDate = new Date(kickedUntil);
        if (expiryDate > new Date()) {
          return true;
        } else {
          // Kick expired
          sessionStorage.removeItem(`kicked_${userId}`);
          sessionStorage.removeItem(`kicked_${userId}_until`);
          return false;
        }
      }
      
      return !!kicked;
    } catch (error) {
      console.error('Error checking if user is kicked:', error);
      return false;
    }
  };

  // Log admin actions
  const logAdminAction = (action: {
    action: string;
    targetUserId: number;
    targetUsername: string;
    timestamp: Date;
    reason?: string;
    duration?: string | 'monthly' | 'yearly';
    expiresAt?: Date;
  }) => {
    try {
      const adminActions = JSON.parse(localStorage.getItem('adminActions') || '[]');
      adminActions.push(action);
      localStorage.setItem('adminActions', JSON.stringify(adminActions));
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  // Get admin action logs
  const getAdminActionLogs = () => {
    try {
      return JSON.parse(localStorage.getItem('adminActions') || '[]');
    } catch (error) {
      console.error('Error getting admin action logs:', error);
      return [];
    }
  };

  return {
    kickUser,
    banUser,
    upgradeToVIP,
    unbanUser,
    isUserBanned,
    isUserKicked,
    isActionInProgress,
    logAdminAction,
    getAdminActionLogs
  };
};
