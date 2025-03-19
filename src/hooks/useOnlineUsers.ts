
import { useState, useEffect, useCallback } from 'react';
import { subscribeToOnlineUsers, getAllUsers } from '@/lib/supabase/users';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  is_online: boolean;
  role?: string;
  last_active?: string;
  [key: string]: any;
}

export function useOnlineUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshUsers = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Load all users initially and on refresh trigger
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        console.log("Loading all users...");
        const allUsers = await getAllUsers();
        
        if (isMounted) {
          console.log(`Loaded ${allUsers.length} users`);
          setUsers(allUsers);
          const online = allUsers.filter(user => user.is_online);
          setOnlineUsers(online);
          setOnlineCount(online.length);
          setError(null);
          
          // Log online users for debugging
          console.log("Online users:", online.map(u => u.username).join(', '));
        }
      } catch (err) {
        console.error('Error in useOnlineUsers:', err);
        if (isMounted) {
          setError('Failed to load users');
          
          // Retry a few times for network errors
          if (retryCount < maxRetries) {
            console.log(`Retrying to load users (${retryCount + 1}/${maxRetries})...`);
            retryCount++;
            setTimeout(loadUsers, 1000 * Math.pow(2, retryCount));
          } else {
            toast.error("Could not load online users. Please refresh the page.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadUsers();
    
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Subscribe to online users updates
  useEffect(() => {
    console.log("Setting up subscription to online users...");
    const unsubscribe = subscribeToOnlineUsers((newOnlineUsers) => {
      console.log(`Online users updated: ${newOnlineUsers.length} users online`);
      setOnlineUsers(newOnlineUsers);
      setOnlineCount(newOnlineUsers.length);
      
      // Update the online status in the full users list
      setUsers(prevUsers => {
        const updatedUsers = [...prevUsers];
        const onlineUserIds = new Set(newOnlineUsers.map(u => u.id));
        
        return updatedUsers.map(user => ({
          ...user,
          is_online: onlineUserIds.has(user.id)
        }));
      });
      
      // Log online users for debugging
      console.log("Online users (from subscription):", newOnlineUsers.map(u => u.username).join(', '));
    });
    
    // Set up periodic refresh as a backup in case the subscription fails
    const intervalId = setInterval(() => {
      refreshUsers();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      console.log("Cleaning up online users subscription");
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [refreshUsers]);

  return {
    users,
    onlineUsers,
    isLoading,
    error,
    onlineCount,
    refreshUsers
  };
}
