
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
    
    const normalizedUsername = username.trim(); // We don't need toLowerCase() since the DB index is case-insensitive now
    console.log(`Checking if username "${normalizedUsername}" is taken...`);
    
    // Use ilike for case-insensitive comparison
    const { data, error, count } = await supabase
      .from('users')
      .select('id, username', { count: 'exact' })
      .ilike('username', normalizedUsername) 
      .limit(1);
    
    if (error) {
      console.error('Error checking username:', error);
      // Return true on error to be safe
      return true;
    }
    
    const isTaken = (count || 0) > 0;
    console.log(`Username "${normalizedUsername}" is ${isTaken ? 'taken' : 'available'} (found ${count} matches)`);
    
    if (isTaken && data && data.length > 0) {
      console.log(`Username taken by user with ID: ${data[0].id}`);
    }
    
    return isTaken;
  } catch (err) {
    console.error('Exception checking username:', err);
    // Return true on error to be safe
    return true;
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

/**
 * Get a user by their username
 * @param username The username to look for
 * @returns Promise<any> The user object or null
 */
export const getUserByUsername = async (username: string): Promise<any | null> => {
  try {
    if (!username || username.trim().length === 0) {
      console.error('Invalid username provided for lookup');
      return null;
    }

    const normalizedUsername = username.trim(); // We don't need toLowerCase() since the DB index is case-insensitive now
    console.log(`Looking up user with username "${normalizedUsername}"...`);
    
    // Use ilike for case-insensitive matching
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', normalizedUsername)
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found
    
    if (error) {
      console.error('Error looking up user by username:', error);
      return null;
    }
    
    if (data) {
      console.log(`Found user with username "${normalizedUsername}":`, data);
    } else {
      console.log(`No user found with username "${normalizedUsername}"`);
    }
    
    return data;
  } catch (err) {
    console.error('Exception looking up user by username:', err);
    return null;
  }
};
