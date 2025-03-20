
import { supabase } from '../client';

/**
 * Subscribe to changes in the online users list
 * @param callback Function to call when the online users list changes
 * @returns A function to unsubscribe from the realtime subscription
 */
export const subscribeToOnlineUsers = (callback: (users: any[]) => void) => {
  console.log('Setting up realtime subscription for online users...');
  
  // Fetch initial data before subscription
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_online', true)
        .order('last_active', { ascending: false });
      
      if (error) {
        console.error('Error fetching initial online users:', error);
        return;
      }
      
      console.log(`Initial data: ${data?.length || 0} online users`);
      callback(data || []);
    } catch (err) {
      console.error('Exception fetching initial online users:', err);
    }
  };
  
  // Fetch initial data
  fetchOnlineUsers();
  
  // Create a realtime subscription for user changes
  const subscription = supabase
    .channel('online_users_channel')
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'users',
        filter: 'is_online=eq.true'
      }, 
      async (payload) => {
        console.log('User table change detected:', payload);
        
        // Fetch the latest online users
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('is_online', true)
            .order('last_active', { ascending: false });
          
          if (error) {
            console.error('Error fetching online users after change:', error);
            return;
          }
          
          console.log(`Notifying callback with ${data?.length || 0} online users`);
          callback(data || []);
        } catch (err) {
          console.error('Exception fetching online users after change:', err);
        }
      }
    )
    .subscribe((status) => {
      console.log('Online users subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to online users changes');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to online users changes');
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log('Attempting to resubscribe to online users channel');
          // We can't call subscribe again on a failed channel, so we'll create a new one
          subscribeToOnlineUsers(callback);
        }, 5000);
      }
    });
  
  // Return an unsubscribe function
  return () => {
    console.log('Unsubscribing from online users');
    subscription.unsubscribe();
  };
};

/**
 * Set up a realtime subscription for a specific user's status
 * @param userId The ID of the user to monitor
 * @param callback Function to call when the user's status changes
 * @returns A function to unsubscribe from the realtime subscription
 */
export const setupRealtimeSubscription = (
  userId: string,
  callback: (isOnline: boolean) => void
) => {
  console.log(`Setting up realtime subscription for user ${userId}...`);
  
  // First check the current status
  const checkCurrentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_online')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error(`Error fetching initial status for user ${userId}:`, error);
        return;
      }
      
      if (data) {
        const isOnline = data.is_online === true;
        console.log(`Initial status for user ${userId}: ${isOnline ? 'online' : 'offline'}`);
        callback(isOnline);
      }
    } catch (err) {
      console.error(`Exception fetching initial status for user ${userId}:`, err);
    }
  };
  
  // Check current status
  checkCurrentStatus();
  
  // Create a realtime subscription for this specific user using channel name that won't conflict
  const subscription = supabase
    .channel(`user_status_${userId}_${Date.now()}`)
    .on('postgres_changes', 
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, 
      (payload) => {
        console.log(`User ${userId} status updated:`, payload);
        
        // Extract the online status from the payload
        const isOnline = payload.new?.is_online === true;
        
        console.log(`User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
        callback(isOnline);
      }
    )
    .subscribe((status) => {
      console.log(`User ${userId} subscription status:`, status);
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to user ${userId} status changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to user ${userId} status changes`);
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log(`Attempting to resubscribe to user ${userId} status changes`);
          // We can't call subscribe again on a failed channel, so we'll try again
          setupRealtimeSubscription(userId, callback);
        }, 5000);
      }
    });
  
  // Return an unsubscribe function
  return () => {
    console.log(`Unsubscribing from user ${userId}`);
    subscription.unsubscribe();
  };
};
