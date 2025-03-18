
import { supabase, connectionState } from './client';
import { toast } from 'sonner';

/**
 * Check if Supabase connection is working properly
 * @returns {Promise<boolean>} Whether the connection is successful
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
        if (!connectionState.connectionWarningShown) {
          connectionState.connectionWarningShown = true;
          toast.error('Could not establish real-time connection to Supabase. Features may be limited.', {
            duration: 6000
          });
        }
        return false;
      }
      
      // If we got here, at least realtime works
      console.log('Successfully connected to Supabase realtime');
      if (!connectionState.connectionSuccessShown) {
        connectionState.connectionSuccessShown = true;
        toast.success('Connected to Supabase successfully!', {
          id: 'supabase-connection-success'
        });
      }
      return true;
    }
    
    console.log('Successfully connected to Supabase database');
    if (!connectionState.connectionSuccessShown) {
      connectionState.connectionSuccessShown = true;
      toast.success('Connected to Supabase successfully!', {
        id: 'supabase-connection-success'
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    if (!connectionState.connectionWarningShown) {
      connectionState.connectionWarningShown = true;
      toast.error('Could not connect to Supabase. Check your console for details.', {
        duration: 6000
      });
    }
    return false;
  }
};
