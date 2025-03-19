import { supabase } from '../client';

/**
 * Check if a username is already taken
 * @param username The username to check
 * @returns Promise<boolean> true if taken, false if available
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    if (!username || username.trim().length === 0) {
      console.error('Invalid username provided for checking');
      return true; // Treat empty usernames as taken
    }
    
    const normalizedUsername = username.trim().toLowerCase(); // Normalize to lowercase
    console.log(`Checking if username "${normalizedUsername}" is taken...`);
    
    // Use ilike for case-insensitive comparison
    const { data, error, count } = await supabase
      .from('users')
      .select('id, username', { count: 'exact' })
      .ilike('username', normalizedUsername) 
      .limit(1);
    
    if (error) {
      console.error('Error checking username:', error);
      // Don't throw, but return false to allow registration attempt
      // The unique constraint will catch it if it's truly a duplicate
      return false;
    }
    
    const isTaken = (count || 0) > 0;
    console.log(`Username "${normalizedUsername}" is ${isTaken ? 'taken' : 'available'} (found ${count} matches)`);
    
    if (isTaken && data && data.length > 0) {
      console.log(`Username taken by user with ID: ${data[0].id}`);
    }
    
    return isTaken;
  } catch (err) {
    console.error('Exception checking username:', err);
    // Don't block registration on username check failure
    return false;
  }
};

/**
 * Get all currently online users
 */
export const getOnlineUsers = async (): Promise<any[]> => {
  try {
    console.log('Fetching online users...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true)
      .order('last_active', { ascending: false });
    
    if (error) {
      console.error('Error getting online users:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} online users`);
    return data || [];
  } catch (err) {
    console.error('Exception getting online users:', err);
    return [];
  }
};

/**
 * Get all users with optional filtering
 */
export const getAllUsers = async (): Promise<any[]> => {
  try {
    console.log('Fetching all users...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_active', { ascending: false });
    
    if (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} users`);
    return data || [];
  } catch (err) {
    console.error('Exception getting all users:', err);
    return [];
  }
};
