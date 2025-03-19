
import { supabase } from '../client';
import { getOnlineUsers } from './userQueries';
import { toast } from 'sonner';

/**
 * Subscribe to online users changes
 * @param callback Function to call when online users change
 * @returns Unsubscribe function
 */
export const subscribeToOnlineUsers = (
  callback: (users: any[]) => void
): (() => void) => {
  try {
    console.log("Setting up subscription to online users changes...");
    
    // Set up channel subscription with enhanced error handling
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
        getOnlineUsers()
          .then(users => {
            console.log(`Retrieved ${users.length} online users after change`);
            callback(users);
          })
          .catch(err => {
            console.error('Error fetching online users after change:', err);
          });
      })
      .subscribe((status) => {
        console.log(`Subscription status for online users: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to online users changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to online users changes');
          toast.error('Connection issue with chat service. Some features may be limited.', {
            id: 'subscription-error',
            duration: 3000
          });
        }
      });
  
    // Initially load online users
    getOnlineUsers()
      .then(users => {
        console.log(`Initially loaded ${users.length} online users`);
        callback(users);
      })
      .catch(err => {
        console.error('Error loading initial online users:', err);
      });
  
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from online users changes');
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Exception in subscribeToOnlineUsers:', err);
    toast.error('Error connecting to real-time updates');
    
    // Return no-op function in case of error
    return () => {};
  }
};

/**
 * Setup realtime subscription for any table
 * @param table Table name
 * @param callback Callback when data changes
 * @returns Unsubscribe function
 */
export const setupRealtimeSubscription = (
  table: string,
  callback: (data: any) => void
): (() => void) => {
  try {
    console.log(`Setting up subscription to ${table} changes...`);
    
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
      .subscribe((status) => {
        console.log(`Subscription status for ${table}: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table} changes`);
          console.warn(`Realtime updates for ${table} may not work correctly`);
        }
      });
    
    return () => {
      console.log(`Unsubscribing from ${table} changes`);
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error(`Exception in setupRealtimeSubscription for ${table}:`, err);
    return () => {};
  }
};
