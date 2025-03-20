
import { supabase } from '../client';
import { toast } from 'sonner';

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
    
    const normalizedUsername = username.trim();
    console.log(`Checking if username "${normalizedUsername}" is taken...`);
    
    // First try exact match
    const { data, error, count } = await supabase
      .from('users')
      .select('id, username', { count: 'exact' })
      .ilike('username', normalizedUsername)
      .limit(1);
    
    if (error) {
      console.error('Error checking username:', error);
      return true; // Return true on error to be safe
    }
    
    const isTaken = (count || 0) > 0;
    console.log(`Username "${normalizedUsername}" is ${isTaken ? 'taken' : 'available'} (found ${count} matches)`);
    
    if (isTaken && data && data.length > 0) {
      console.log(`Username taken by user with ID: ${data[0].id}`);
    }
    
    return isTaken;
  } catch (err) {
    console.error('Exception checking username:', err);
    return true; // Return true on error to be safe
  }
};

/**
 * Generate a unique username variation if the original is taken
 * @param baseUsername The original username to start with
 * @returns Promise<string> A unique available username
 */
export const generateUniqueUsername = async (baseUsername: string): Promise<string> => {
  // Try the original first
  const originalUsername = baseUsername.trim();
  const isOriginalTaken = await isUsernameTaken(originalUsername);
  
  if (!isOriginalTaken) {
    return originalUsername;
  }
  
  // If original is taken, try adding random numbers
  let attempts = 0;
  const maxAttempts = 10; // Limit attempts to prevent infinite loops
  
  while (attempts < maxAttempts) {
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const newUsername = `${originalUsername}${randomSuffix}`;
    const isTaken = await isUsernameTaken(newUsername);
    
    if (!isTaken) {
      console.log(`Generated unique username: ${newUsername}`);
      return newUsername;
    }
    
    attempts++;
  }
  
  // If all attempts fail, use timestamp-based suffix which should be unique
  const timestampSuffix = Date.now() % 10000;
  const finalUsername = `${originalUsername}${timestampSuffix}`;
  console.log(`Using timestamp-based unique username: ${finalUsername}`);
  
  return finalUsername;
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

    const normalizedUsername = username.trim();
    console.log(`Looking up user with username "${normalizedUsername}"...`);
    
    // Use ilike for case-insensitive matching
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('username', normalizedUsername)
      .limit(1)
      .maybeSingle();
    
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
