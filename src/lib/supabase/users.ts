import { supabase } from './client';
import { toast } from 'sonner';
import { generateStableUUID, generateUniqueUUID } from './utils';

/**
 * Check if a username is already taken
 * @param username The username to check
 * @returns Promise resolving to boolean indicating if username is taken
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    // Skip empty usernames
    if (!username || username.trim() === '') {
      return false;
    }
    
    const { data, error, count } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('username', username);
    
    if (error) {
      console.error('Error checking username:', error);
      toast.error('Error checking username availability');
      return false;
    }
    
    return count ? count > 0 : false;
  } catch (err) {
    console.error('Exception checking username:', err);
    toast.error('Error checking username availability');
    return false;
  }
};

/**
 * Register a new user in the database or update existing user
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
    // Ensure we have valid inputs
    if (!username || username.trim() === '') {
      console.error('Invalid username for registration');
      toast.error('Username cannot be empty');
      return false;
    }
    
    // Generate a valid UUID - always use a completely unique UUID for new users
    const validUserId = typeof userId === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) 
      ? userId 
      : generateUniqueUUID();
    
    console.log(`Registering/updating user ${username} with ID ${validUserId}`);
    
    // First check if username is taken by someone else
    const isTaken = await isUsernameTaken(username);
    if (isTaken) {
      console.error(`Username ${username} is already taken`);
      toast.error(`Username ${username} is already taken. Please choose another.`);
      return false;
    }
    
    // Check if user with same ID exists
    const { data: existingUserId, error: checkIdError } = await supabase
      .from('users')
      .select('username')
      .eq('id', validUserId)
      .maybeSingle();
    
    if (checkIdError) {
      console.error('Error checking existing user ID:', checkIdError);
      toast.error('Error during registration process');
      return false;
    }
    
    // If user with same ID exists, update their data
    if (existingUserId) {
      console.log(`User with ID ${validUserId} exists, updating data`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          username: username, 
          role,
          is_online: true,
          last_active: new Date().toISOString()
        })
        .eq('id', validUserId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        toast.error('Error updating user data');
        return false;
      }
      
      toast.success(`Welcome back, ${username}!`);
      return true;
    }
    
    // Otherwise, insert new user
    const userData = {
      id: validUserId,
      username: username,
      role,
      is_online: true,
      last_active: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('users')
      .insert(userData);
    
    if (insertError) {
      // Check if it's a unique constraint violation
      if (insertError.message.includes('unique constraint')) {
        console.error('Username already taken:', insertError);
        toast.error(`Username ${username} is already taken. Please choose another.`);
      } else {
        console.error('Error registering user:', insertError);
        toast.error('Failed to register user. Please try again.');
      }
      return false;
    }
    
    console.log(`User ${username} registered successfully with ID ${validUserId}`);
    toast.success(`Welcome to the chat, ${username}!`);
    return true;
  } catch (err) {
    console.error('Exception registering user:', err);
    toast.error('An unexpected error occurred during registration');
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
    const validUserId = typeof userId === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) 
      ? userId 
      : generateStableUUID(userId);
    
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
      toast.error('Error updating online status');
      return false;
    }
    
    console.log(`User ${validUserId} online status updated to ${isOnline}`);
    return true;
  } catch (err) {
    console.error('Exception updating user online status:', err);
    toast.error('Error updating online status');
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
      toast.error('Error fetching online users');
      return [];
    }
    
    console.log(`Found ${data?.length || 0} online users`);
    return data || [];
  } catch (err) {
    console.error('Exception fetching online users:', err);
    toast.error('Error fetching online users');
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
  // Create a channel specifically for this subscription
  const channelId = `online-users-${Date.now()}`;
  
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
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
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to online users');
        toast.error('Error connecting to user presence system');
        // Retry after a short delay
        setTimeout(() => {
          console.log('Attempting to reconnect online users subscription');
          channel.subscribe();
        }, 3000);
      }
    });
  
  return () => {
    console.log('Unsubscribing from online users');
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
    
    // Create a channel for realtime subscription with unique ID
    const channelId = `realtime_${tableName}_${Date.now()}`;
    
    const channel = supabase.channel(channelId)
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
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${tableName} table`);
          // Retry after a short delay
          setTimeout(() => {
            console.log(`Retrying subscription to ${tableName} table`);
            channel.subscribe();
          }, 3000);
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
 * Get all users
 * @returns Promise resolving to array of all users
 */
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username', { ascending: true });
    
    if (error) {
      console.error('Error fetching all users:', error);
      toast.error('Error fetching user list');
      return [];
    }
    
    console.log(`Found ${data?.length || 0} total users`);
    return data || [];
  } catch (err) {
    console.error('Exception fetching all users:', err);
    toast.error('Error fetching user list');
    return [];
  }
};

// Export a custom hook for online users to avoid React import in this file
export { useOnlineUsers } from '../../hooks/useOnlineUsers';
