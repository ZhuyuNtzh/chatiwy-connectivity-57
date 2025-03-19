
import { supabase } from '../client';
import { generateStableUUID } from '../utils';
import { isUsernameTaken } from './userQueries';

/**
 * Register a new user or update existing user
 * @param userId UUID for the user
 * @param username Username for display
 * @param role User role (standard, vip, admin)
 * @returns Promise<boolean> indicating success
 */
export const registerUser = async (
  userId: string | number,
  username: string,
  role: string = 'standard'
): Promise<boolean> => {
  try {
    // Generate a valid UUID if needed
    const validUserId = typeof userId === 'string' ? 
      (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ? 
        userId : 
        generateStableUUID(userId)) : 
      generateStableUUID(userId.toString());
    
    console.log(`Registering user with ID: ${validUserId} and username: ${username}`);
    
    // Check if username is available first
    const isTaken = await isUsernameTaken(username);
    if (isTaken) {
      console.error(`Username ${username} is already taken`);
      return false;
    }
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', validUserId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing user:', fetchError);
      throw fetchError;
    }
    
    // If user exists, update
    if (existingUser) {
      console.log(`User ${username} already exists, updating online status`);
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_online: true,
          last_active: new Date().toISOString()
        })
        .eq('id', validUserId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
      return true;
    }
    
    // Create new user using upsert with onConflict to handle race conditions
    const { error: insertError } = await supabase
      .from('users')
      .upsert([{ 
        id: validUserId,
        username,
        role,
        is_online: true,
        last_active: new Date().toISOString()
      }], { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      throw insertError;
    }
    
    console.log(`User ${username} registered successfully with ID: ${validUserId}`);
    
    // Store the UUID in localStorage for persistence
    localStorage.setItem('userUUID', validUserId);
    localStorage.setItem('username', username);
    
    return true;
  } catch (err) {
    console.error('Exception registering user:', err);
    return false;
  }
};

/**
 * Update a user's online status
 * @param userId The user's UUID
 * @param isOnline Whether the user is online
 */
export const updateUserOnlineStatus = async (
  userId: string | number,
  isOnline: boolean
): Promise<boolean> => {
  try {
    const validUserId = typeof userId === 'string' ? 
      (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ? 
        userId : 
        generateStableUUID(userId)) : 
      generateStableUUID(userId.toString());
    
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
    
    return true;
  } catch (err) {
    console.error('Exception updating user online status:', err);
    return false;
  }
};
