import { supabase } from './client';
import { toast } from 'sonner';
import React from 'react';

/**
 * Check if a username is already taken
 * @param username The username to check
 * @returns Promise resolving to boolean indicating if username is taken
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking username:', error);
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error('Exception checking username:', err);
    return false;
  }
};

/**
 * Register a new user in the database
 * @param userId The user's ID to register
 * @param username The username to register
 * @param role The user's role
 * @returns Promise resolving to boolean indicating success
 */
export const registerUser = async (
  userId: string,
  username: string,
  role: string = 'standard'
): Promise<boolean> => {
  try {
    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return false;
    }
    
    // If user exists, just return true
    if (existingUser) {
      console.log(`User ${username} already registered`);
      return true;
    }
    
    // Otherwise, insert new user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username,
        role,
        is_online: true,
        last_active: new Date().toISOString()
      });
    
    if (insertError) {
      console.error('Error registering user:', insertError);
      toast.error('Failed to register user. Please try again.', {
        duration: 5000,
      });
      return false;
    }
    
    console.log(`User ${username} registered successfully`);
    return true;
  } catch (err) {
    console.error('Exception registering user:', err);
    return false;
  }
};

/**
 * Update a user's online status
 * @param userId The user's ID to update
 * @param isOnline Whether the user is online
 * @returns Promise resolving to boolean indicating success
 */
export const updateUserOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user online status:', error);
      return false;
    }
    
    console.log(`User ${userId} online status updated to ${isOnline}`);
    return true;
  } catch (err) {
    console.error('Exception updating user online status:', err);
    return false;
  }
};

/**
 * Get all online users
 * @returns Promise resolving to array of online users
 */
export const getOnlineUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true);
    
    if (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception fetching online users:', err);
    return [];
  }
};

/**
 * Subscribe to changes in user online status
 * @param callback Function to call when user status changes
 * @returns Function to unsubscribe
 */
export const subscribeToOnlineUsers = (
  callback: (users: any[]) => void
) => {
  const channel = supabase
    .channel('public:users')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'is_online=eq.true'
      },
      (payload) => {
        console.log('User status changed:', payload);
        // Fetch all online users when any user's status changes
        getOnlineUsers().then(callback);
      }
    )
    .subscribe((status) => {
      console.log(`User status subscription: ${status}`);
      if (status === 'SUBSCRIBED') {
        // Initial fetch of online users
        getOnlineUsers().then(callback);
      }
    });
  
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Setup realtime subscription for a table
 * @param tableName The name of the table to subscribe to
 * @returns Promise resolving to boolean indicating success
 */
export const setupRealtimeSubscription = async (
  tableName: string
): Promise<boolean> => {
  try {
    // Fix TypeScript error by using type assertion
    const { error } = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: tableName }
    );
    
    if (error) {
      console.error(`Error setting up realtime for ${tableName}:`, error);
      return false;
    }
    
    console.log(`Realtime subscription for ${tableName} enabled successfully`);
    return true;
  } catch (err) {
    console.error(`Exception setting up realtime for ${tableName}:`, err);
    return false;
  }
};

/**
 * Create a new hook for tracking online users
 * @returns Object containing online users and count
 */
export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = React.useState<any[]>([]);
  const [onlineCount, setOnlineCount] = React.useState<number>(0);
  
  React.useEffect(() => {
    // Set up subscription to online users
    const unsubscribe = subscribeToOnlineUsers((users) => {
      setOnlineUsers(users);
      setOnlineCount(users.length);
    });
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  return { onlineUsers, onlineCount };
};
