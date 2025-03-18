
import { supabase } from './client';
import { toast } from 'sonner';

// Global connection state to prevent multiple warnings
let connectionWarningShown = false;
let connectionSuccessShown = false;

/**
 * Check if Supabase connection is available
 * @returns Promise resolving to boolean indicating if connection is successful
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
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

/**
 * Enable realtime for users table if it doesn't exist already
 * @returns Promise resolving to boolean indicating if operation was successful
 */
export const enableRealtimeForUsers = async (): Promise<boolean> => {
  try {
    // Check if the function already exists
    const { error: checkError } = await (supabase.rpc as any)(
      'enable_realtime_for_users', 
      {}
    );
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Creating enable_realtime_for_users function...');
      
      // Create the function to enable realtime for users table
      const { error } = await (supabase.rpc as any)(
        'create_enable_realtime_function', 
        {}
      );
      
      if (error) {
        console.error('Error creating realtime function:', error);
        return false;
      }
      
      // Now execute the function
      const { error: execError } = await (supabase.rpc as any)(
        'enable_realtime_for_users', 
        {}
      );
      
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

/**
 * Initialize Supabase connection and enable necessary features
 * @returns Promise resolving to boolean indicating if initialization was successful
 */
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    // First check connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      return false;
    }
    
    // Enable realtime for all required tables
    const { enableRealtimeForChat } = await import('./realtime');
    const isRealtimeEnabled = await enableRealtimeForChat();
    
    return isRealtimeEnabled;
  } catch (err) {
    console.error('Exception initializing Supabase:', err);
    return false;
  }
};
