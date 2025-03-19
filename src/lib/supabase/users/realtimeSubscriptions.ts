
import { supabase } from '../client';

/**
 * Subscribe to changes in the online users list
 * @param callback Function to call when the online users list changes
 * @returns A function to unsubscribe from the realtime subscription
 */
export const subscribeToOnlineUsers = (callback: (users: any[]) => void) => {
  console.log('Setting up realtime subscription for online users...');
  
  // Create a realtime subscription for user changes
  const subscription = supabase
    .channel('public:users')
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'users'
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
      console.log('User subscription status:', status);
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
  
  // Create a realtime subscription for this specific user
  const subscription = supabase
    .channel(`public:users:id=eq.${userId}`)
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
    });
  
  // Return an unsubscribe function
  return () => {
    console.log(`Unsubscribing from user ${userId}`);
    subscription.unsubscribe();
  };
};
