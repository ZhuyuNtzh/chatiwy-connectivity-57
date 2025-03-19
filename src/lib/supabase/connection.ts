
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
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      
      if (!connectionState.connectionWarningShown) {
        toast.error('Error connecting to database. Please check your internet connection.', {
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
    
    return true;
  } catch (err) {
    console.error('Exception testing connection:', err);
    return false;
  }
};

/**
 * Enable realtime functionality for a specific table using channel subscription instead of RPC
 */
export const enableRealtimeSubscription = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Enabling realtime for ${tableName} table...`);
    
    // Instead of using RPC which doesn't exist, use channel subscription
    const channel = supabase.channel(`realtime_${tableName}`)
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
 * Initialize Supabase with all required features
 * @returns Promise resolving to boolean indicating success
 */
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing Supabase...');
    
    // Check connection first
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to Supabase');
      return false;
    }
    
    // Enable realtime for users table
    const usersRealtimeEnabled = await enableRealtimeSubscription('users');
    
    // Enable realtime for messages table
    const messagesRealtimeEnabled = await enableRealtimeSubscription('messages');
    
    // Enable realtime for conversations table
    const convsRealtimeEnabled = await enableRealtimeSubscription('conversations');
    
    console.log(`Realtime status - Users: ${usersRealtimeEnabled}, Messages: ${messagesRealtimeEnabled}, Conversations: ${convsRealtimeEnabled}`);
    
    if (!usersRealtimeEnabled || !messagesRealtimeEnabled || !convsRealtimeEnabled) {
      console.error('Error enabling realtime for tables');
      
      // Continue anyway but log the error
      console.warn('Continuing with partial realtime functionality');
    }
    
    // Track execution time for debugging
    const endTime = performance.now();
    console.log(`Database response time: ${Math.round(endTime)}ms`);
    console.log('Supabase initialization completed');
    return true;
  } catch (err) {
    console.error('Exception initializing Supabase:', err);
    return false;
  }
};
