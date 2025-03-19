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
 * Generate a valid UUID from any string to ensure compatibility
 * @param input Any string or number
 * @returns A valid UUID string
 */
const generateStableUUID = (input: string | number): string => {
  // If it's already a valid UUID, return it
  if (typeof input === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input)) {
    return input;
  }
  
  // Otherwise generate a deterministic UUID using crypto API
  const str = input.toString();
  
  // Simple algorithm to create a stable UUID-like string
  // Note: This is NOT a proper UUID but will work for our demo
  const namespace = '00000000-0000-0000-0000-000000000000';
  return namespace.replace(/[0]/g, (c, i) => {
    if (i < str.length) {
      // Use character code as hex digit
      const code = str.charCodeAt(i % str.length);
      return (code % 16).toString(16);
    }
    return c;
  });
};

/**
 * Register a new user in the database
 * @param userId The user's ID to register
 * @param username The username to register
 * @param role The user's role
 * @returns Promise resolving to boolean indicating success
 */
export const registerUser = async (
  userId: string | number,
  username: string,
  role: string = 'standard'
): Promise<boolean> => {
  try {
    // Generate a valid UUID for the user
    const validUserId = generateStableUUID(userId);
    
    console.log(`Registering/updating user ${username} with ID ${validUserId}`);
    
    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return false;
    }
    
    // If user with same username exists, just return true
    if (existingUser) {
      console.log(`User with username ${username} already registered with ID ${existingUser.id}`);
      return true;
    }
    
    // Check if user with same ID exists
    const { data: existingUserId, error: checkIdError } = await supabase
      .from('users')
      .select('username')
      .eq('id', validUserId)
      .maybeSingle();
    
    if (checkIdError) {
      console.error('Error checking existing user ID:', checkIdError);
    }
    
    // If user with same ID exists, update their username
    if (existingUserId) {
      console.log(`User with ID ${validUserId} already exists with username ${existingUserId.username}, updating to ${username}`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ username, role })
        .eq('id', validUserId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        return false;
      }
      
      return true;
    }
    
    // Otherwise, insert new user
    const userData = {
      id: validUserId,
      username,
      role,
      is_online: true,
      last_active: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('users')
      .insert(userData);
    
    if (insertError) {
      console.error('Error registering user:', insertError);
      toast.error('Failed to register user. Please try again.', {
        duration: 5000,
      });
      return false;
    }
    
    console.log(`User ${username} registered successfully with ID ${validUserId}`);
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
  userId: string | number,
  isOnline: boolean
): Promise<boolean> => {
  try {
    // Generate a valid UUID for the user
    const validUserId = generateStableUUID(userId);
    
    console.log(`Updating online status for user ID ${validUserId} to ${isOnline}`);
    
    const { error } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_active: new Date().toISOString()
      })
      .eq('id', validUserId);
    
    if (error) {
      console.error('Error updating user online status:', error);
      return false;
    }
    
    console.log(`User ${validUserId} online status updated to ${isOnline}`);
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
    console.log(`Setting up realtime subscription for ${tableName} table...`);
    
    // Create a channel for realtime subscription
    const channel = supabase.channel(`realtime_${tableName}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
      }, (payload) => {
        console.log(`Realtime change in ${tableName}:`, payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${tableName} table changes`);
        } else {
          console.log(`Subscription status for ${tableName}: ${status}`);
        }
      });
    
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
