
import { supabase } from '../client';
import { toast } from 'sonner';
import { isUsernameTaken, getUserByUsername, generateUniqueUsername } from './userQueries';

/**
 * Register a new user in the database
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
    
    // Check if this user ID already exists
    const { data: existingUserData, error: userCheckError } = await supabase
      .from('users')
      .select('username, is_online')
      .eq('id', userId)
      .maybeSingle();
      
    if (userCheckError) {
      console.error('Error checking existing user:', userCheckError);
    }
      
    // If the user exists, just update their online status
    if (existingUserData) {
      console.log(`User ID ${userId} already exists with username "${existingUserData.username}", updating online status`);
      const success = await updateUserOnlineStatus(userId, true);
      return {
        success: success, 
        username: existingUserData.username,
        message: 'User reconnected'
      };
    }
    
    // Try to normalize the username
    let finalUsername = username.trim();
    
    // Check if username is taken by someone else
    try {
      const existingUser = await getUserByUsername(finalUsername);
      
      if (existingUser && existingUser.id !== userId) {
        console.log(`Username "${finalUsername}" is taken, generating a unique alternative...`);
        finalUsername = await generateUniqueUsername(finalUsername);
        
        if (finalUsername !== username) {
          console.log(`Using alternative username: ${finalUsername}`);
          // Only notify if username was actually changed
          toast.info(`Username "${username}" was taken. Using "${finalUsername}" instead.`);
        }
      }
    } catch (checkError) {
      console.error("Error checking if username is taken:", checkError);
    }
    
    console.log(`Attempting to register user ${finalUsername} with ID ${userId}`);
    
    // Now try to insert the user with the potentially modified username
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            id: userId,
            username: finalUsername,
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
        
        // If there's still a username conflict, try one more time with timestamp
        if (error.code === '23505' && error.message.includes('username')) {
          const timestampUsername = `${finalUsername}${Date.now() % 10000}`;
          console.log(`Final attempt with timestamp username: ${timestampUsername}`);
          
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .upsert(
              {
                id: userId,
                username: timestampUsername,
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
            
          if (retryError) {
            console.error('Error on retry registration:', retryError);
            return {
              success: false, 
              username: finalUsername, 
              message: 'Failed to register user after multiple attempts'
            };
          }
          
          toast.info(`Using username "${timestampUsername}" instead of "${username}"`);
          return {
            success: true, 
            username: timestampUsername, 
            message: 'Registered with modified username'
          };
        }
        
        if (error.code === '42501') {
          console.error('RLS policy violation');
          return {
            success: false, 
            username: finalUsername, 
            message: 'Server permission error'
          };
        }
        
        return {
          success: false, 
          username: finalUsername, 
          message: 'Registration error'
        };
      }
      
      console.log(`User ${finalUsername} registered successfully with ID ${userId}`);
      return {success: true, username: finalUsername};
    } catch (regError) {
      console.error('Exception registering user:', regError);
      return {
        success: false, 
        username: finalUsername, 
        message: 'Unexpected registration error'
      };
    }
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
