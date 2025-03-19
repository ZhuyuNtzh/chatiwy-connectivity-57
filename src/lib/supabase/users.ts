
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Check if a username is already taken
 * @param username The username to check
 * @returns Whether the username is already taken
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  if (!username) return false;
  
  try {
    console.log(`Checking if username "${username}" is already taken...`);
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .ilike('username', username)  // Case-insensitive check
      .limit(1);
      
    if (error) {
      console.error('Error checking username:', error);
      toast.error('Error checking username availability. Please try again.', {
        duration: 4000
      });
      
      // In case of error, assume taken to be safe
      toast.warning('Username validation inconclusive. Please try a different username.', {
        duration: 5000
      });
      return true;
    }
    
    const isTaken = Array.isArray(data) && data.length > 0;
    console.log(`Username "${username}" is ${isTaken ? 'already taken' : 'available'}`);
    
    // If taken, show a more specific error with the actual username
    if (isTaken) {
      toast.error(`Username "${username}" is already taken. Please choose a different username.`, {
        duration: 6000
      });
    }
    
    return isTaken;
  } catch (err) {
    console.error('Exception checking username:', err);
    toast.error('Network error checking username. Please check your connection.', {
      duration: 5000
    });
    // Assume taken to be safe
    return true;
  }
};

/**
 * Register or update a user in the database
 * @param userId The user's ID
 * @param username The user's username
 * @param role The user's role
 * @returns Whether the operation was successful
 */
export const registerUser = async (userId: string, username: string, role: string = 'standard'): Promise<boolean> => {
  if (!userId || !username) {
    console.error('Invalid userId or username for registration');
    toast.error('Missing user information for registration', {
      duration: 5000
    });
    return false;
  }
  
  try {
    console.log(`Registering/updating user ${username} with ID ${userId}`);
    
    // First, check if this user ID already exists (returning user)
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing user:', checkError);
      toast.error('Error checking user account. Please try again.', {
        duration: 5000
      });
    }
    
    // If user exists with this ID but has a different username,
    // check if the new username is taken by someone else
    if (existingUser && existingUser.username !== username) {
      const isTaken = await isUsernameTaken(username);
      if (isTaken) {
        toast.error(`Username "${username}" is already taken. Please choose another.`, {
          duration: 6000
        });
        return false;
      }
    }
    
    // If this is a new user, check if username is taken
    if (!existingUser) {
      const isTaken = await isUsernameTaken(username);
      if (isTaken) {
        return false;
      }
    }
    
    // Now we can upsert the user record
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        username,
        role,
        is_online: true,
        last_active: new Date().toISOString()
      }, {
        onConflict: 'id'  // Only update if ID matches
      });
      
    if (error) {
      // Handle constraint violations
      if (error.code === '23505') { // Duplicate key error
        if (error.message.includes('username')) {
          toast.error(`Username "${username}" is already taken. Please choose another.`, {
            duration: 6000
          });
        } else {
          toast.error('A user with this ID already exists.', {
            duration: 5000
          });
        }
      } else {
        console.error('Error registering user:', error);
        toast.error('Failed to register user. Please try again.', {
          duration: 5000
        });
      }
      return false;
    }
    
    console.log(`User ${username} registered/updated successfully with ID ${userId}`);
    return true;
  } catch (err) {
    console.error('Exception registering user:', err);
    toast.error('An unexpected error occurred during registration.', {
      duration: 6000
    });
    return false;
  }
};

/**
 * Update a user's online status
 * @param userId The user's ID
 * @param isOnline Whether the user is online
 * @returns Whether the operation was successful
 */
export const updateUserOnlineStatus = async (userId: string, isOnline: boolean): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    console.log(`Updating online status for user ${userId} to ${isOnline}`);
    const { error } = await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        last_active: new Date().toISOString() 
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating user online status:', error);
      return false;
    }
    
    console.log(`User ${userId} online status updated to ${isOnline}`);
    return true;
  } catch (err) {
    console.error('Exception updating user online status:', err);
    return false;
  }
};

/**
 * Get all online users
 * @returns An array of online users
 */
export const getOnlineUsers = async (): Promise<any[]> => {
  try {
    console.log("Fetching online users...");
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_online', true);
      
    if (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} online users`);
    return data || [];
  } catch (err) {
    console.error('Exception fetching online users:', err);
    return [];
  }
};
