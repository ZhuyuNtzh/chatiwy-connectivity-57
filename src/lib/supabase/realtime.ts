
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Enable realtime functionality for the users table
 */
export const enableRealtimeForUsers = async (): Promise<boolean> => {
  try {
    console.log('Enabling realtime for users table...');
    
    // Enable realtime for the users table
    const { error } = await supabase.rpc(
      'enable_realtime_subscription',
      { table_name: 'users' }
    );
    
    if (error) {
      console.error('Error enabling realtime for users:', error);
      return false;
    }
    
    console.log('Successfully enabled realtime for users table');
    return true;
  } catch (err) {
    console.error('Exception enabling realtime:', err);
    return false;
  }
};

/**
 * Sets up a realtime channel for a specific conversation
 * @param conversationId The ID of the conversation to subscribe to
 * @param onMessage Callback when a new message is received
 * @returns The channel object for unsubscribing later
 */
export const subscribeToConversation = (
  conversationId: string,
  onMessage: (message: any) => void
) => {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('New message in conversation:', payload);
        onMessage(payload.new);
      }
    )
    .subscribe();
    
  return channel;
};

/**
 * Sets up a realtime channel for user presence
 * @param userId The current user's ID
 * @param onUserStatusChange Callback when a user's status changes
 * @returns The channel object for unsubscribing later
 */
export const setupUserPresence = (
  userId: string,
  onUserStatusChange: (userId: string, isOnline: boolean) => void
) => {
  // Create a presence channel for online users
  const presenceChannel = supabase.channel('online-users', {
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
      console.log('Current online users:', state);
      
      // Process each user in the presence state
      Object.keys(state).forEach(key => {
        if (key !== userId) {
          onUserStatusChange(key, true);
        }
      });
    })
    .on('presence', { event: 'join' }, ({ key }) => {
      console.log('User came online:', key);
      if (key !== userId) {
        onUserStatusChange(key, true);
      }
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      console.log('User went offline:', key);
      if (key !== userId) {
        onUserStatusChange(key, false);
      }
    });

  // Subscribe to the channel
  presenceChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Track the user's presence once subscribed
      await presenceChannel.track({
        online_at: new Date().toISOString(),
        username: userId
      });
    }
  });

  return presenceChannel;
};
