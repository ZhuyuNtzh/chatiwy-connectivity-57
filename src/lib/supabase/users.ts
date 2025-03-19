
import { supabase } from './client';
import { generateStableUUID, generateUniqueUUID } from './utils';

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

/**
 * Subscribe to online users changes
 * @param callback Function to call when online users change
 */
export const subscribeToOnlineUsers = (
  callback: (users: any[]) => void
): (() => void) => {
  // Set up channel subscription
  const channel = supabase
    .channel('public:users')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'users',
      filter: 'is_online=eq.true'
    }, payload => {
      console.log('Online users changed:', payload);
      // Refresh the online users list
      getOnlineUsers().then(callback);
    })
    .subscribe();
  
  // Initially load online users
  getOnlineUsers().then(callback);
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Setup realtime subscription for any table
 * @param table Table name
 * @param callback Callback when data changes
 */
export const setupRealtimeSubscription = (
  table: string,
  callback: (data: any) => void
): (() => void) => {
  const channel = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table
    }, payload => {
      console.log(`${table} change:`, payload);
      callback(payload);
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};
