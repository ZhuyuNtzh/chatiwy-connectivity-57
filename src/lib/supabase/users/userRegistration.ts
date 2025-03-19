import { supabase } from '../client';
import { toast } from 'sonner';
import { isUsernameTaken } from './userQueries';

/**
 * Register a new user in the database
 * @param userId Unique identifier for the user
 * @param username The user's displayed name
 * @param role The user's role in the system
 * @returns boolean indicating if registration was successful
 */
export const registerUser = async (
  userId: string,
  username: string,
  role: string = 'standard'
): Promise<boolean> => {
  try {
    if (!userId || !username || username.trim() === '') {
      console.error('Invalid user data provided for registration');
      toast.error('Please provide both user ID and username');
      return false;
    }
    
    // First check if username is taken
    const normalizedUsername = username.trim();
    
    try {
      // Try to register directly since the database constraint will catch duplication
      console.log(`Attempting to register user ${normalizedUsername} with ID ${userId}`);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          username: normalizedUsername,
          role,
          is_online: true,
          last_active: new Date().toISOString()
        })
        .select('id, username')
        .single();
      
      if (error) {
        console.error('Error registering user:', error);
        
        // Check for duplicate username error
        if (error.code === '23505' || error.message.includes('duplicate key value')) {
          console.error(`Username "${normalizedUsername}" is already taken due to unique constraint violation`);
          toast.error(`Username "${normalizedUsername}" is already taken. Please choose another username.`);
          return false;
        }
        
        // Check for RLS policy error
        if (error.code === '42501') {
          console.error('RLS policy violation - make sure the SQL script has been executed');
          toast.error('Server error with RLS policy. Please try again or contact support.');
          return false;
        }
        
        toast.error('Failed to register user. Please try again.');
        return false;
      }
      
      if (!data) {
        console.error('No data returned from user registration');
        toast.error('Failed to register user. Please try again.');
        return false;
      }
      
      console.log(`User ${normalizedUsername} registered successfully with ID ${userId}`);
      return true;
    } catch (err) {
      console.error('Exception registering user:', err);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    }
  } catch (err) {
    console.error('Exception in outer registration process:', err);
    toast.error('An unexpected error occurred. Please try again.');
    return false;
  }
};

/**
 * Update user's online status
 * @param userId User ID to update
 * @param isOnline Boolean flag for online status
 */
export const updateUserOnlineStatus = async (
  userId: string,
  isOnline: boolean
): Promise<boolean> => {
  try {
    if (!userId) {
      console.error('No user ID provided for status update');
      return false;
    }
    
    const { error } = await supabase
      .from('users')
      .update({ 
        is_online: isOnline, 
        last_active: new Date().toISOString() 
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating online status:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception updating online status:', err);
    return false;
  }
};
