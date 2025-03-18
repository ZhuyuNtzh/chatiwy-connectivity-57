
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { toast } from 'sonner';
import { supabase as configuredSupabase } from '../integrations/supabase/client';

// Use the already configured client from integrations/supabase/client.ts
export const supabase = configuredSupabase;

// Global connection state to prevent multiple warnings
let connectionWarningShown = false;
let connectionSuccessShown = false;

// Add a simple health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    
    // Try to query for the presence of the users table first
    const { data, error: userTableError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    // If that fails, try another table
    if (userTableError) {
      console.error('Could not query users table:', userTableError.message);
      console.log('Falling back to realtime presence test...');
      
      // Try to create a test channel to verify Supabase connection
      const testChannel = supabase.channel('connection-test');
      
      // Create a promise to wait for subscription
      const subscriptionPromise = new Promise<boolean>((resolve) => {
        const timeoutId = setTimeout(() => {
          console.error('Supabase realtime subscription timed out');
          resolve(false);
        }, 5000);
        
        testChannel.subscribe((status) => {
          clearTimeout(timeoutId);
          console.log('Supabase realtime subscription status:', status);
          resolve(status === 'SUBSCRIBED');
          // Clean up test channel
          testChannel.unsubscribe();
        });
      });
      
      const isConnected = await subscriptionPromise;
      
      if (!isConnected) {
        console.error('Failed to connect to Supabase realtime');
        if (!connectionWarningShown) {
          connectionWarningShown = true;
          toast.error('Could not establish real-time connection to Supabase. Features may be limited.', {
            duration: 6000
          });
        }
        return false;
      }
      
      // If we got here, at least realtime works
      console.log('Successfully connected to Supabase realtime');
      if (!connectionSuccessShown) {
        connectionSuccessShown = true;
        toast.success('Connected to Supabase successfully!', {
          id: 'supabase-connection-success'
        });
      }
      return true;
    }
    
    console.log('Successfully connected to Supabase database');
    if (!connectionSuccessShown) {
      connectionSuccessShown = true;
      toast.success('Connected to Supabase successfully!', {
        id: 'supabase-connection-success'
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    if (!connectionWarningShown) {
      connectionWarningShown = true;
      toast.error('Could not connect to Supabase. Check your console for details.', {
        duration: 6000
      });
    }
    return false;
  }
};

// Function to enable realtime for users table if it doesn't exist already
export const enableRealtimeForUsers = async () => {
  try {
    // Check if the function already exists
    // Fix type error by using any type to bypass TypeScript checking for RPC
    const { error: checkError } = await supabase.rpc('enable_realtime_for_users', {} as any);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Creating enable_realtime_for_users function...');
      
      // Create the function to enable realtime for users table
      // Fix type error by using any type
      const { error } = await supabase.rpc('create_enable_realtime_function', {} as any);
      
      if (error) {
        console.error('Error creating realtime function:', error);
        return false;
      }
      
      // Now execute the function
      // Fix type error by using any type
      const { error: execError } = await supabase.rpc('enable_realtime_for_users', {} as any);
      
      if (execError) {
        console.error('Error enabling realtime:', execError);
        return false;
      }
      
      console.log('Successfully enabled realtime for users table');
      return true;
    } else if (checkError) {
      console.error('Error checking realtime function:', checkError);
      return false;
    }
    
    console.log('Realtime for users already enabled');
    return true;
  } catch (err) {
    console.error('Exception enabling realtime:', err);
    return false;
  }
};

// Check for unique username - add more robust error handling
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  if (!username) return false;
  
  try {
    console.log(`Checking if username "${username}" is already taken...`);
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .limit(1);
      
    if (error) {
      console.error('Error checking username:', error);
      toast.error('Error checking username availability. Please try again.', {
        duration: 4000
      });
      
      // In case of error, assume not taken to allow user to try again
      // but warn them about potential issues
      toast.warning('Username validation was inconclusive. There might be issues with your account.', {
        duration: 5000
      });
      return false;
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
    return false;
  }
};

// Improve user registration with better error handling
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
    
    // Now we can upsert the user record
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        username,
        role,
        is_online: true,
        last_active: new Date().toISOString()
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

// Update a user's online status
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

// Get all online users
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

// Check connection immediately to catch configuration issues early
checkSupabaseConnection()
  .then(isConnected => {
    console.log(`Initial Supabase connection check: ${isConnected ? 'Connected' : 'Failed'}`);
  })
  .catch(err => console.error('Connection check error:', err));
