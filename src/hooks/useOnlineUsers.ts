
import { useState, useEffect } from 'react';
import { getOnlineUsers, subscribeToOnlineUsers } from '@/lib/supabase/users';
import { toast } from 'sonner';

/**
 * Hook to track online users with real-time updates
 * @returns Object with online users, count, and loading state
 */
export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Initial fetch of online users
    getOnlineUsers()
      .then((users) => {
        setOnlineUsers(users);
        console.log(`Initial online users count: ${users.length}`);
      })
      .catch((err) => {
        console.error('Error fetching online users:', err);
        setError('Failed to load online users');
        toast.error('Could not load active users. Please refresh the page.');
      })
      .finally(() => {
        setIsLoading(false);
      });
      
    // Subscribe to real-time updates
    const unsubscribe = subscribeToOnlineUsers((updatedUsers) => {
      console.log(`Real-time online users update: ${updatedUsers.length} users`);
      setOnlineUsers(updatedUsers);
    });
    
    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isLoading,
    error,
    // Helper functions
    getByRole: (role: string) => onlineUsers.filter(user => user.role === role),
    getStandardUsers: () => onlineUsers.filter(user => user.role === 'standard'),
    getVipUsers: () => onlineUsers.filter(user => user.role === 'vip'),
    getAdminUsers: () => onlineUsers.filter(user => user.role === 'admin'),
  };
};
