
import { supabase } from '../client';
import { getOnlineUsers } from './userQueries';

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
