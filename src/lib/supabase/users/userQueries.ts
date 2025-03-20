
import { supabase } from '../client';
import { toast } from 'sonner';

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
 * Get a user by their username - no longer checking uniqueness
 * @param username The username to look for
 * @returns Promise<any> The first matching user object or null
 */
export const getUserByUsername = async (username: string): Promise<any | null> => {
  try {
    if (!username || username.trim().length === 0) {
      console.error('Invalid username provided for lookup');
      return null;
    }

    const normalizedUsername = username.trim();
    console.log(`Looking up user with username "${normalizedUsername}"...`);
    
    // Use ilike for case-insensitive matching
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', `%${normalizedUsername}%`)
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error looking up user by username:', error);
      return null;
    }
    
    if (data) {
      console.log(`Found user with username matching "${normalizedUsername}":`, data);
    } else {
      console.log(`No user found with username containing "${normalizedUsername}"`);
    }
    
    return data;
  } catch (err) {
    console.error('Exception looking up user by username:', err);
    return null;
  }
};

/**
 * Get a user by their ID
 * @param userId The user ID to look for
 * @returns Promise<any> The user object or null
 */
export const getUserById = async (userId: string): Promise<any | null> => {
  try {
    if (!userId) {
      console.error('Invalid user ID provided for lookup');
      return null;
    }

    console.log(`Looking up user with ID "${userId}"...`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error looking up user by ID:', error);
      return null;
    }
    
    if (data) {
      console.log(`Found user with ID "${userId}":`, data);
    } else {
      console.log(`No user found with ID "${userId}"`);
    }
    
    return data;
  } catch (err) {
    console.error('Exception looking up user by ID:', err);
    return null;
  }
};

/**
 * The username is no longer checked for uniqueness
 * This function is kept for API compatibility
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  // We no longer enforce unique usernames
  return false;
};

/**
 * Generate a unique username 
 * Now simply appends a timestamp
 */
export const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  const timestamp = Date.now() % 10000;
  const uniqueUsername = `${baseUsername}_${timestamp}`;
  console.log(`Generated unique username: ${uniqueUsername}`);
  return uniqueUsername;
};
