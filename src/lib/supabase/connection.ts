
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
 * Enable realtime functionality for the users table
 */
export const enableRealtimeSubscription = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Enabling realtime for ${tableName} table...`);
    
    // Fix TypeScript error by using type assertion
    const { error } = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: tableName }
    );
    
    if (error) {
      console.error(`Error enabling realtime for ${tableName}:`, error);
      return false;
    }
    
    console.log(`Successfully enabled realtime for ${tableName} table`);
    return true;
  } catch (err) {
    console.error(`Exception enabling realtime for ${tableName}:`, err);
    return false;
  }
};

/**
 * Enable realtime functionality for the users table
 */
export const enableRealtimeForUsers = async (): Promise<boolean> => {
  return enableRealtimeSubscription('users');
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
    const usersRealtimeEnabled = await enableRealtimeForUsers();
    
    // Enable realtime for messages table
    const messagesRealtimeEnabled = await enableRealtimeSubscription('messages');
    
    // Enable realtime for conversations table
    const convsRealtimeEnabled = await enableRealtimeSubscription('conversations');
    
    if (!usersRealtimeEnabled || !messagesRealtimeEnabled || !convsRealtimeEnabled) {
      console.error('Error enabling realtime for tables');
      
      // Continue anyway but log the error
      console.warn('Continuing with partial realtime functionality');
    }
    
    console.log('Supabase initialized successfully');
    return true;
  } catch (err) {
    console.error('Exception initializing Supabase:', err);
    return false;
  }
};
