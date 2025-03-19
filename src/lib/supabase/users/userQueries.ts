
import { supabase } from '../client';

/**
 * Check if a username is already taken
 * @param username The username to check
 * @returns Promise<boolean> true if taken, false if available
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  try {
    if (!username || username.trim().length === 0) {
      console.error('Invalid username provided');
      return true; // Treat empty usernames as taken
    }
    
    const { data, error, count } = await supabase
      .from('users')
      .select('username', { count: 'exact' })
      .eq('username', username.trim())
      .limit(1);
    
    if (error) {
      console.error('Error checking username:', error);
      throw error;
    }
    
    return (count || 0) > 0;
  } catch (err) {
    console.error('Exception checking username:', err);
    return false; // In case of error, let them try
  }
};

/**
 * Get all currently online users
 */
export const getOnlineUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true)
      .order('last_active', { ascending: false });
    
    if (error) {
      console.error('Error getting online users:', error);
      throw error;
    }
    
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_active', { ascending: false });
    
    if (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception getting all users:', err);
    return [];
  }
};
