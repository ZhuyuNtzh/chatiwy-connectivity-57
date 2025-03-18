
import { supabase } from './client';
import { toast } from 'sonner';

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
    // Fix type error by using explicit type casting for RPC
    const { error: checkError } = await supabase.rpc(
      'enable_realtime_for_users' as any, 
      {} as any
    );
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Creating enable_realtime_for_users function...');
      
      // Create the function to enable realtime for users table
      // Fix type error by using explicit type casting
      const { error } = await supabase.rpc(
        'create_enable_realtime_function' as any, 
        {} as any
      );
      
      if (error) {
        console.error('Error creating realtime function:', error);
        return false;
      }
      
      // Now execute the function
      // Fix type error by using explicit type casting
      const { error: execError } = await supabase.rpc(
        'enable_realtime_for_users' as any, 
        {} as any
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
