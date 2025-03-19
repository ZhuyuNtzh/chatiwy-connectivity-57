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
      return false;
    }
    
    // Generate a valid UUID - always use a completely unique UUID for new users
    const validUserId = typeof userId === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) 
      ? userId 
      : generateUniqueUUID();
    
    console.log(`Registering/updating user ${username} with ID ${validUserId}`);
    
    // Check if username is taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      // Continue anyway, as this might be a temporary issue
    }
    
    // If username is taken by another user, append a random suffix to make it unique
    let finalUsername = username;
    if (existingUser && existingUser.id !== validUserId) {
      const randomSuffix = Math.floor(Math.random() * 1000);
      finalUsername = `${username}_${randomSuffix}`;
      console.log(`Username ${username} is taken, using ${finalUsername} instead`);
      
      // Silent notification to avoid disrupting UX
      console.warn(`Username modified to ensure uniqueness: ${finalUsername}`);
    }
    
    // Check if user with same ID exists
    const { data: existingUserId, error: checkIdError } = await supabase
      .from('users')
      .select('username')
      .eq('id', validUserId)
      .maybeSingle();
    
    if (checkIdError) {
      console.error('Error checking existing user ID:', checkIdError);
      // Continue anyway, as this might be a temporary issue
    }
    
    // If user with same ID exists, update their data
    if (existingUserId) {
      console.log(`User with ID ${validUserId} exists, updating data`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          username: finalUsername, 
          role,
          is_online: true,
          last_active: new Date().toISOString()
        })
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
      username: finalUsername,
      role,
      is_online: true,
      last_active: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('users')
      .insert(userData);
    
    if (insertError) {
      console.error('Error registering user:', insertError);
      // Don't show toast error to improve UX
      console.warn('Failed to register user in database, but continuing');
      return false;
    }
    
    console.log(`User ${finalUsername} registered successfully with ID ${validUserId}`);
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

// Export a custom hook for online users to avoid React import in this file
export { useOnlineUsers } from '../../hooks/useOnlineUsers';
