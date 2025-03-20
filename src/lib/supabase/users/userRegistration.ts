
import { supabase } from '../client';
import { toast } from 'sonner';

/**
 * Register a new user in the database - with simplified approach for unique usernames
 * @param userId Unique identifier for the user
 * @param username The user's displayed name
 * @param role The user's role in the system
 * @returns Promise with registration result {success, username, message}
 */
export const registerUser = async (
  userId: string,
  username: string,
  role: string = 'standard'
): Promise<{success: boolean, username: string, message?: string}> => {
  try {
    if (!userId) {
      console.error('Invalid user ID provided for registration');
      return {success: false, username: username, message: 'Missing user ID'};
    }
    
    if (!username || username.trim() === '') {
      console.error('Invalid username provided for registration');
      return {success: false, username: username, message: 'Missing username'};
    }
    
    // First check if this user ID already exists
    const { data: existingUserData, error: userCheckError } = await supabase
      .from('users')
      .select('username, is_online')
      .eq('id', userId)
      .maybeSingle();
      
    // If the user exists, just update their online status
    if (existingUserData) {
      console.log(`User ID ${userId} already exists with username "${existingUserData.username}", updating online status`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_online: true, 
          last_active: new Date().toISOString() 
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating online status:', updateError);
        return {
          success: false, 
          username: existingUserData.username,
          message: 'Failed to update online status'
        };
      }
      
      return {
        success: true, 
        username: existingUserData.username,
        message: 'User reconnected'
      };
    }
    
    // For new users, check if we need to create a unique username
    // Check if the original username already exists
    const { data: usernameCheck, error: usernameCheckError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.trim())
      .maybeSingle();
    
    let finalUsername = username.trim();
    
    // If username exists, create a unique one - but only if it truly exists
    if (usernameCheck) {
      // Generate a unique username by appending timestamp
      // Use a shorter suffix to make it less obvious
      const baseUsername = username.trim();
      const timestamp = Date.now() % 1000; // Last 3 digits of timestamp
      finalUsername = `${baseUsername}${timestamp}`;
      
      console.log(`Username "${baseUsername}" already exists, using "${finalUsername}" instead`);
    }
    
    console.log(`Registering user with username: ${finalUsername} and ID ${userId}`);
    
    // Insert the user with the unique username
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: finalUsername,
        role,
        is_online: true,
        last_active: new Date().toISOString()
      })
      .select('id, username')
      .single();
    
    if (error) {
      console.error('Error registering user:', error);
      
      // If there's still an error, try one more time with an even more unique name
      const retryUsername = `${finalUsername}${Math.floor(Math.random() * 100)}`;
      console.log(`Final attempt with retry username: ${retryUsername}`);
      
      const { data: retryData, error: retryError } = await supabase
        .from('users')
        .insert({
          id: userId,
          username: retryUsername,
          role,
          is_online: true,
          last_active: new Date().toISOString()
        })
        .select('id, username')
        .single();
        
      if (retryError) {
        console.error('Error on retry registration:', retryError);
        return {
          success: false, 
          username: finalUsername, 
          message: 'Failed to register user after multiple attempts'
        };
      }
      
      if (retryUsername !== username) {
        toast.info(`Using username "${retryUsername}" instead of "${username}"`);
      }
      return {
        success: true, 
        username: retryUsername, 
        message: 'Registered with modified username'
      };
    }
    
    console.log(`User ${finalUsername} registered successfully with ID ${userId}`);
    if (finalUsername !== username && finalUsername !== username.trim()) {
      toast.info(`Using username "${finalUsername}" instead of "${username}"`);
    }
    return {success: true, username: finalUsername};
  } catch (err) {
    console.error('Exception in registration process:', err);
    return {
      success: false, 
      username: username, 
      message: 'Unexpected error'
    };
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
