
import { useState, useEffect } from 'react';
import { subscribeToOnlineUsers, getAllUsers } from '@/lib/supabase/users';

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

  // Load all users initially
  useEffect(() => {
    let isMounted = true;
    
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const allUsers = await getAllUsers();
        
        if (isMounted) {
          setUsers(allUsers);
          const online = allUsers.filter(user => user.is_online);
          setOnlineUsers(online);
          setOnlineCount(online.length);
          setError(null);
        }
      } catch (err) {
        console.error('Error in useOnlineUsers:', err);
        if (isMounted) {
          setError('Failed to load users');
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
  }, []);

  // Subscribe to online users updates
  useEffect(() => {
    const unsubscribe = subscribeToOnlineUsers((newOnlineUsers) => {
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
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    users,
    onlineUsers,
    isLoading,
    error,
    onlineCount
  };
}
