
import { supabase } from './client';
import { connectionState } from './client';
import { toast } from 'sonner';

/**
 * Check if Supabase connection is working
 * @returns Promise resolving to boolean indicating connection status
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Perform a simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      
      if (!connectionState.connectionWarningShown) {
        toast.error('Connection issue detected. Trying to reconnect...', {
          duration: 5000,
        });
        connectionState.connectionWarningShown = true;
      }
      
      return false;
    }
    
    console.log('Successfully connected to Supabase');
    
    // Only show success toast once per session
    if (!connectionState.connectionSuccessShown) {
      toast.success('Connected to chat service', {
        duration: 3000,
      });
      connectionState.connectionSuccessShown = true;
    }
    
    // Reset connection warning flag
    connectionState.connectionWarningShown = false;
    
    return true;
  } catch (err) {
    console.error('Exception testing connection:', err);
    return false;
  }
};

/**
 * Enable realtime functionality for a specific table using channel subscription
 */
export const enableRealtimeSubscription = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Enabling realtime for ${tableName} table...`);
    
    // Generate a unique channel ID
    const channelId = `realtime_${tableName}_${Date.now()}`;
    
    // Use channel subscription for realtime updates
    const channel = supabase.channel(channelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName,
      }, (payload) => {
        console.log(`Realtime change in ${tableName}:`, payload);
      })
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${tableName}: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to realtime changes for ${tableName}`);
          connectionState.realtimeEnabled = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to realtime changes for ${tableName}`);
          // Try to resubscribe
          setTimeout(() => {
            console.log(`Attempting to resubscribe to ${tableName}`);
            channel.subscribe();
          }, 3000);
        }
      });
    
    // Wait a bit to ensure subscription is established
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Successfully enabled realtime for ${tableName} table`);
    return true;
  } catch (err) {
    console.error(`Exception enabling realtime for ${tableName}:`, err);
    return false;
  }
};

/**
 * Initialize Supabase with all required features, with retry
 * @param retries Number of retries allowed
 * @returns Promise resolving to boolean indicating success
 */
export const initializeSupabase = async (retries = 3): Promise<boolean> => {
  try {
    console.log('Initializing Supabase...');
    
    // Check connection first
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to Supabase');
      
      if (retries > 0) {
        console.log(`Retrying connection (${retries} attempts left)...`);
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return initializeSupabase(retries - 1);
      }
      
      return false;
    }
    
    // Enable realtime for users table
    const usersRealtimeEnabled = await enableRealtimeSubscription('users');
    
    // Enable realtime for messages table
    const messagesRealtimeEnabled = await enableRealtimeSubscription('messages');
    
    // Enable realtime for conversations table
    const convsRealtimeEnabled = await enableRealtimeSubscription('conversations');
    
    // Enable realtime for conversation_participants table
    const partsRealtimeEnabled = await enableRealtimeSubscription('conversation_participants');
    
    console.log(`Realtime status - Users: ${usersRealtimeEnabled}, Messages: ${messagesRealtimeEnabled}, Conversations: ${convsRealtimeEnabled}, Participants: ${partsRealtimeEnabled}`);
    
    const allEnabled = usersRealtimeEnabled && messagesRealtimeEnabled && convsRealtimeEnabled && partsRealtimeEnabled;
    
    if (!allEnabled) {
      console.warn('Some tables failed to enable realtime. Will continue with partial functionality.');
      
      // Try again for failed tables in the background
      setTimeout(() => {
        console.log('Retrying enabling realtime for tables in background...');
        if (!usersRealtimeEnabled) enableRealtimeSubscription('users');
        if (!messagesRealtimeEnabled) enableRealtimeSubscription('messages');
        if (!convsRealtimeEnabled) enableRealtimeSubscription('conversations');
        if (!partsRealtimeEnabled) enableRealtimeSubscription('conversation_participants');
      }, 5000);
    }
    
    // Set up automatic reconnection
    setupReconnectionCheck();
    
    // Track execution time for debugging
    const endTime = performance.now();
    console.log(`Database response time: ${Math.round(endTime)}ms`);
    console.log('Supabase initialization completed');
    return true;
  } catch (err) {
    console.error('Exception initializing Supabase:', err);
    
    if (retries > 0) {
      console.log(`Retrying initialization (${retries} attempts left)...`);
      // Wait before retrying with exponential backoff
      const delay = 2000 * Math.pow(2, 3 - retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return initializeSupabase(retries - 1);
    }
    
    return false;
  }
};

/**
 * Set up automatic reconnection check
 */
const setupReconnectionCheck = () => {
  // Set up a timer to periodically check connection
  setInterval(async () => {
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.warn('Connection check failed. Attempting to reinitialize...');
      initializeSupabase(1); // Try once
    }
  }, 60000); // Check every minute
};
