import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Enable realtime functionality for the users table
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
  if (!conversationId) {
    console.error('Invalid conversation ID for subscription');
    return null;
  }

  console.log(`Setting up subscription for conversation ${conversationId}`);
  
  // Create a unique channel name to prevent conflicts
  const channelId = `conversation:${conversationId}:${Date.now()}`;
  
  const channel = supabase
    .channel(channelId)
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
      console.log(`Conversation subscription status: ${status} for ${conversationId}`);
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to conversation: ${conversationId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to conversation: ${conversationId}`);
        toast.error('Connection issue. Trying to reconnect...');
        
        // Automatically attempt to resubscribe after a delay
        setTimeout(() => {
          console.log(`Attempting to resubscribe to conversation: ${conversationId}`);
          channel.subscribe();
        }, 3000);
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
  if (!userId) {
    console.error('Invalid user ID for presence tracking');
    return null;
  }

  console.log(`Setting up presence for user ${userId}`);
  
  // Create a unique channel name with timestamp to avoid conflicts
  const channelName = `online-users:${Date.now()}`;
  
  // Create a presence channel for online users
  const presenceChannel = supabase.channel(channelName, {
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
      console.log('Current online users (sync):', state);
      
      // Process each user in the presence state
      Object.keys(state).forEach(key => {
        if (key !== userId) {
          onUserStatusChange(key, true);
        }
      });
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User came online:', key, newPresences);
      if (key !== userId) {
        onUserStatusChange(key, true);
      }
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User went offline:', key, leftPresences);
      if (key !== userId) {
        onUserStatusChange(key, false);
      }
    });

  // Subscribe to the channel
  presenceChannel.subscribe(async (status) => {
    console.log(`Presence channel status: ${status}`);
    if (status === 'SUBSCRIBED') {
      try {
        // Track the user's presence once subscribed
        await presenceChannel.track({
          online_at: new Date().toISOString(),
          user_id: userId,
          username: userId // Fallback, will be replaced with actual username later
        });
        console.log(`User presence tracking activated for: ${userId}`);
      } catch (error) {
        console.error('Error tracking presence:', error);
      }
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
  if (!userId) {
    console.error('Invalid user ID for status broadcast');
    return false;
  }
  
  try {
    console.log(`Broadcasting user status: ${userId} is ${isOnline ? 'online' : 'offline'}`);
    
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

/**
 * Set up basic heartbeat to ensure the connection stays alive
 * @returns A function to stop the heartbeat interval
 */
export const setupConnectionHeartbeat = (): (() => void) => {
  const heartbeatInterval = setInterval(async () => {
    try {
      // Ping the database with a minimal query to keep connection alive
      const { error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.warn('Heartbeat error:', error);
      }
    } catch (err) {
      console.error('Error in connection heartbeat:', err);
    }
  }, 30000); // 30 seconds
  
  return () => clearInterval(heartbeatInterval);
};
