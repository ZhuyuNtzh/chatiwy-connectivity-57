
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Enable realtime functionality for the users table
 */
export const enableRealtimeForUsers = async (): Promise<boolean> => {
  try {
    console.log('Enabling realtime for users table...');
    
    // Use explicit type casting to handle Supabase RPC typing issues
    // TypeScript doesn't recognize custom RPC functions, so we use a type assertion
    const { error } = await (supabase.rpc as any)(
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
    .subscribe((status) => {
      console.log(`Conversation subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to conversation: ${conversationId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to conversation: ${conversationId}`);
        toast.error('Connection issue. Trying to reconnect...');
      }
    });
    
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
    console.log(`Presence channel status: ${status}`);
    if (status === 'SUBSCRIBED') {
      // Track the user's presence once subscribed
      await presenceChannel.track({
        online_at: new Date().toISOString(),
        username: userId
      });
      console.log(`User presence tracking activated for: ${userId}`);
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Error subscribing to presence channel');
      // Retry connection after a short delay
      setTimeout(() => {
        console.log('Attempting to reconnect presence channel...');
        presenceChannel.subscribe();
      }, 3000);
    }
  });

  return presenceChannel;
};

/**
 * Broadcasts a user's online status to all clients
 * @param userId The user's ID to broadcast
 * @param isOnline Whether the user is online or offline
 */
export const broadcastUserStatus = async (
  userId: string,
  isOnline: boolean
): Promise<boolean> => {
  try {
    // Update the user's online status in the database
    const { error } = await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user online status:', error);
      return false;
    }
    
    console.log(`Broadcasted user status: ${userId} is ${isOnline ? 'online' : 'offline'}`);
    return true;
  } catch (err) {
    console.error('Exception broadcasting user status:', err);
    return false;
  }
};

/**
 * Enable realtime for all tables needed for the chat functionality
 */
export const enableRealtimeForChat = async (): Promise<boolean> => {
  try {
    console.log('Enabling realtime for chat tables...');
    
    // Enable for users
    const usersResult = await enableRealtimeForUsers();
    
    // Enable for messages
    const { error: messagesError } = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: 'messages' }
    );
    
    // Enable for conversations
    const { error: convsError } = await (supabase.rpc as any)(
      'enable_realtime_subscription',
      { table_name: 'conversations' }
    );
    
    if (messagesError || convsError) {
      console.error('Error enabling realtime:', messagesError || convsError);
      return false;
    }
    
    console.log('Successfully enabled realtime for chat tables');
    return true;
  } catch (err) {
    console.error('Exception enabling realtime for chat:', err);
    return false;
  }
};
