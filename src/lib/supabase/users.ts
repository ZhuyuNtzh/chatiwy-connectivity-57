
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
    
    // After successful registration, broadcast user status and enable realtime
    await broadcastUserStatus(userId.toString(), true);
    const realtimeEnabled = await setupRealtimeSubscription();
    
    if (!realtimeEnabled) {
      toast.warning('Live updates may be limited. You might need to refresh to see new messages.', {
        duration: 5000
      });
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
    
    // Broadcast status change
    await broadcastUserStatus(userId, isOnline);
    
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

/**
 * Set up realtime subscription to user status changes
 * @returns Success status
 */
export const setupRealtimeSubscription = async (): Promise<boolean> => {
  try {
    console.log('Setting up realtime subscription for user status...');
    
    // Cast supabase.rpc to any to bypass TypeScript errors
    const { error } = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: 'users' }
    );
    
    if (error) {
      console.error('Error enabling realtime subscription:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error setting up realtime subscription:', err);
    return false;
  }
};

/**
 * Broadcast user status to other clients
 * @param userId User ID
 * @param isOnline Whether user is online
 */
export const broadcastUserStatus = async (userId: string, isOnline: boolean): Promise<boolean> => {
  try {
    console.log(`Broadcasting user status for ${userId} (online: ${isOnline})`);
    
    // Update the database record
    const { error } = await supabase
      .from('users')
      .update({
        is_online: isOnline,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) {
      console.error('Error broadcasting user status:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in broadcastUserStatus:', err);
    return false;
  }
};

/**
 * Subscribe to online users updates
 * @param onUsersChange Callback when user list changes
 * @returns A function to unsubscribe
 */
export const subscribeToOnlineUsers = (onUsersChange: (users: any[]) => void): (() => void) => {
  // Create a channel for the users table
  const channel = supabase
    .channel('public:users')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' }, 
      async (payload) => {
        console.log('User change detected:', payload);
        // Fetch updated user list when any user status changes
        const onlineUsers = await getOnlineUsers();
        onUsersChange(onlineUsers);
      }
    )
    .subscribe((status) => {
      console.log(`User subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        // Initial load of online users
        getOnlineUsers().then(onUsersChange);
      }
    });
    
  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from online users');
    supabase.removeChannel(channel);
  };
};
