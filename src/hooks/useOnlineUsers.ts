
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getOnlineUsers } from '@/lib/supabase/users';

/**
 * Hook for tracking online users
 * @returns Object containing online users array and count
 */
export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  
  useEffect(() => {
    // Fetch initial online users
    const fetchOnlineUsers = async () => {
      const users = await getOnlineUsers();
      setOnlineUsers(users);
      setOnlineCount(users.length);
    };
    
    fetchOnlineUsers();
    
    // Subscribe to online user updates
    const channel = supabase
      .channel('online-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'is_online=eq.true'
        },
        (payload) => {
          console.log('User online status changed:', payload);
          // Refresh the full list when any user's status changes
          fetchOnlineUsers();
        }
      )
      .subscribe((status) => {
        console.log(`Online users subscription status: ${status}`);
      });
    
    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { onlineUsers, onlineCount };
};
