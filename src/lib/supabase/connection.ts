
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Check if Supabase connection is working
 * @returns Whether the connection is working
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    // Try to ping Supabase (select minimal data for fast response)
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return false;
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('Exception testing Supabase connection:', err);
    return false;
  }
};

/**
 * Enable realtime functionality for all required tables
 * @returns Whether realtime was successfully enabled
 */
export const enableRealtimeForUsers = async (): Promise<boolean> => {
  try {
    console.log('Enabling realtime for users table...');
    
    // Use explicit type casting to handle Supabase RPC typing issues
    const { error } = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: 'users' }
    );
    
    if (error) {
      console.error('Error enabling realtime for users:', error);
      toast.error('Failed to enable realtime updates. Chat functionality may be limited.', {
        duration: 5000
      });
      return false;
    }
    
    console.log('Successfully enabled realtime for users table');
    return true;
  } catch (err) {
    console.error('Exception enabling realtime:', err);
    toast.error('Failed to enable realtime updates. Please refresh the page.', {
      duration: 5000
    });
    return false;
  }
};

/**
 * Initialize Supabase with all required functionality
 * @returns Whether initialization was successful
 */
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing Supabase...');
    
    // First, check connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to Supabase');
      toast.error('Cannot connect to chat service. Please check your internet connection.', {
        duration: 6000
      });
      return false;
    }
    
    // Enable realtime for users
    const realtimeEnabled = await enableRealtimeForUsers();
    
    // Enable realtime for messages and conversations
    const messagesEnabled = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: 'messages' }
    ).then(
      (res: { error: any }) => !res.error,
      () => false
    );
    
    const conversationsEnabled = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: 'conversations' }
    ).then(
      (res: { error: any }) => !res.error,
      () => false
    );
    
    // Log realtime status
    console.log(`Realtime status - Users: ${realtimeEnabled}, Messages: ${messagesEnabled}, Conversations: ${conversationsEnabled}`);
    
    // If any realtime enablement failed, show warning but don't fail entirely
    if (!realtimeEnabled || !messagesEnabled || !conversationsEnabled) {
      toast.warning('Some realtime features may be limited. You might need to refresh to see updates.', {
        duration: 6000
      });
    }
    
    // Check for active database connection
    const activeConnection = await checkActiveDatabaseConnection();
    if (!activeConnection) {
      console.warn('Database appears to be connected but not fully active');
      toast.warning('Chat service connection is unstable. Some features may be delayed.', {
        duration: 5000
      });
    }
    
    console.log('Supabase initialization completed');
    return true;
  } catch (err) {
    console.error('Exception initializing Supabase:', err);
    toast.error('Failed to initialize chat service. Please refresh the page.', {
      duration: 6000
    });
    return false;
  }
};

/**
 * Check if database has an active, responsive connection
 * @returns Whether the database is actively responding
 */
const checkActiveDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Check database time to verify active connection
    const startTime = Date.now();
    const { data, error } = await supabase.rpc('get_server_timestamp');
    
    if (error) {
      console.error('Error checking active database connection:', error);
      return false;
    }
    
    // Measure response time
    const responseTime = Date.now() - startTime;
    console.log(`Database response time: ${responseTime}ms`);
    
    // Verify we got a valid timestamp response
    const hasValidTimestamp = data && typeof data === 'string' && new Date(data).getTime() > 0;
    console.log(`Database timestamp check: ${hasValidTimestamp ? 'Valid' : 'Invalid'}`);
    
    return hasValidTimestamp && responseTime < 5000; // Response should be under 5 seconds
  } catch (err) {
    console.error('Exception checking active database connection:', err);
    return false;
  }
};
