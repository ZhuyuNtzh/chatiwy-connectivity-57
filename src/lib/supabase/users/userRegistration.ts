
import { supabase } from '../client';
import { toast } from 'sonner';
import { isUsernameTaken, getUserByUsername } from './userQueries';

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
      // Check for existing user with this username (now case-insensitive due to the DB index)
      const existingUser = await getUserByUsername(normalizedUsername);
      
      if (existingUser) {
        // If the existing user has the same ID as the current user, just update online status
        if (existingUser.id === userId) {
          console.log(`User ${normalizedUsername} is reconnecting with ID ${userId}`);
          const success = await updateUserOnlineStatus(userId, true);
          return success;
        } else {
          console.error(`Username "${normalizedUsername}" is already taken by user ID ${existingUser.id}`);
          toast.error(`Username "${normalizedUsername}" is already taken. Please choose another username.`);
          return false;
        }
      }
    } catch (checkError) {
      console.error("Error checking if username is taken:", checkError);
      // Continue with registration attempt - the database constraint will catch duplicates
    }
    
    console.log(`Attempting to register user ${normalizedUsername} with ID ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: userId,
            username: normalizedUsername,
            role,
            is_online: true,
            last_active: new Date().toISOString()
          },
          { 
            onConflict: 'id', 
            ignoreDuplicates: false 
          }
        )
        .select('id, username')
        .single();
      
      if (error) {
        console.error('Error registering user:', error);
        
        // Handle specific error cases
        if (error.code === '23505' && error.message.includes('username')) {
          console.error(`Username "${normalizedUsername}" is already taken due to unique constraint violation`);
          toast.error(`Username "${normalizedUsername}" is already taken. Please choose another username.`);
          return false;
        }
        
        if (error.code === '42501') {
          console.error('RLS policy violation');
          toast.error('Server error with permissions. Please try again or contact support.');
          return false;
        }
        
        toast.error('Failed to register user. Please try again.');
        return false;
      }
      
      console.log(`User ${normalizedUsername} registered successfully with ID ${userId}`);
      return true;
    } catch (regError) {
      console.error('Exception registering user:', regError);
      toast.error('An unexpected error occurred. Please try again.');
      return false;
    }
  } catch (err) {
    console.error('Exception in registration process:', err);
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
    
    console.log(`Updating user ${userId} online status to ${isOnline}`);
    
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
    
    console.log(`Successfully updated online status for user ${userId} to ${isOnline}`);
    return true;
  } catch (err) {
    console.error('Exception updating online status:', err);
    return false;
  }
};
