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
  
  // Set up a presence channel for tracking online users
  const presenceChannel = supabase.channel('online_users_presence', {
    config: {
      presence: {
        key: 'online_users',
      },
    },
  });
  
  // Handle presence state changes
  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      // When presence syncs, fetch the latest users from the database
      // This ensures we have complete user data, not just presence data
      fetchOnlineUsers();
    })
    .on('presence', { event: 'join' }, async ({ key, newPresences }) => {
      console.log('User presence join:', key, newPresences);
      // When a user joins, fetch the latest online users
      fetchOnlineUsers();
    })
    .on('presence', { event: 'leave' }, async ({ key, leftPresences }) => {
      console.log('User presence leave:', key, leftPresences);
      // When a user leaves, fetch the latest online users
      fetchOnlineUsers();
    })
    .subscribe((status) => {
      console.log('Online users presence channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to online users presence');
        
        // Track our monitoring presence to keep the channel alive
        presenceChannel.track({
          type: 'monitor',
          online_at: new Date().toISOString()
        });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to online users presence');
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log('Attempting to resubscribe to online users presence');
          presenceChannel.subscribe();
        }, 5000);
      }
    });
  
  // Also set up a traditional database change subscription as a fallback
  const dbChannel = supabase
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
      console.log('Online users DB subscription status:', status);
      if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to online users DB changes');
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log('Attempting to resubscribe to online users DB channel');
          dbChannel.subscribe();
        }, 5000);
      }
    });
  
  // Return an unsubscribe function that cleans up both channels
  return () => {
    console.log('Unsubscribing from online users');
    supabase.removeChannel(presenceChannel);
    supabase.removeChannel(dbChannel);
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
  
  // Set up a presence channel specifically for this user
  const presenceChannel = supabase.channel(`presence_user_${userId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });
  
  // Handle presence state changes
  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const isUserPresent = state[userId] && state[userId].length > 0;
      console.log(`User ${userId} presence sync: ${isUserPresent ? 'online' : 'offline'}`);
      callback(isUserPresent);
    })
    .on('presence', { event: 'join' }, ({ key }) => {
      if (key === userId) {
        console.log(`User ${userId} joined presence: online`);
        callback(true);
      }
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      if (key === userId) {
        console.log(`User ${userId} left presence: offline`);
        callback(false);
      }
    })
    .subscribe((status) => {
      console.log(`User ${userId} presence subscription: ${status}`);
      if (status === 'CHANNEL_ERROR') {
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log(`Attempting to resubscribe to user ${userId} presence`);
          presenceChannel.subscribe();
        }, 5000);
      }
    });
  
  // Also create a database subscription as a fallback
  const dbChannel = supabase
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
      console.log(`User ${userId} DB subscription status:`, status);
      if (status === 'CHANNEL_ERROR') {
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log(`Attempting to resubscribe to user ${userId} DB changes`);
          dbChannel.subscribe();
        }, 5000);
      }
    });
  
  // Return an unsubscribe function that cleans up both channels
  return () => {
    console.log(`Unsubscribing from user ${userId}`);
    supabase.removeChannel(presenceChannel);
    supabase.removeChannel(dbChannel);
  };
};
