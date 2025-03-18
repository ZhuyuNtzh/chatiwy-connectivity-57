import { supabase, isUsernameTaken, registerUser, updateUserOnlineStatus } from '@/lib/supabase';
import type { ChatMessage, ConnectionStatus, UserReport } from './signalR/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

class SupabaseService {
  private userId: string | null = null;
  private username: string | null = null;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private deleteCallbacks: ((messageId: string) => void)[] = [];
  private typingCallbacks: ((userId: number) => void)[] = [];
  private connectionStatus: ConnectionStatus = 'disconnected';
  private connectionStatusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private connectedUsersCountCallbacks: ((count: number) => void)[] = [];
  private subscriptions: { unsubscribe: () => void }[] = [];
  private blockedUsersCache: Record<number, boolean> = {};
  private presenceChannel: any = null;

  public get currentUserId(): string {
    return this.userId || '';
  }

  // Convert string IDs to numbers for backward compatibility during transition
  private toNumberId(id: string): number {
    try {
      // Try to parse as number if it's a numeric string
      if (/^\d+$/.test(id)) {
        return parseInt(id, 10);
      }
      // Otherwise use a hash function
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    } catch (e) {
      console.error("Error converting ID", e);
      return 0;
    }
  }

  public async initialize(userId: string, username: string): Promise<void> {
    console.log(`Initializing Supabase service for user ${username} (ID: ${userId})`);
    
    // Clear any previous user data if there was a session
    if (this.userId && this.userId !== userId) {
      await this.disconnect();
    }
    
    this.userId = userId;
    this.username = username;
    
    // Update user online status in the database
    const statusUpdated = await updateUserOnlineStatus(userId, true);
    if (!statusUpdated) {
      // If update failed, try to register the user first
      console.log(`User ${userId} not found, attempting registration...`);
      const registered = await registerUser(userId, username);
      if (!registered) {
        console.error(`Failed to register user ${username}`);
        return Promise.reject(new Error('Failed to register user'));
      }
    }
    
    // Set up real-time subscriptions after user is confirmed registered
    console.log(`Setting up realtime subscriptions for user ${username}`);
    this.setupRealtimeSubscriptions();
    
    // Set up presence channel for online status
    console.log(`Setting up presence channel for user ${username}`);
    this.setupPresenceChannel(username);
    
    // Get connected users count
    await this.fetchConnectedUsersCount();
    
    // Update connection status
    this.updateConnectionStatus('connected');
    
    console.log(`Supabase service initialized for user ${username} (ID: ${userId})`);
    return Promise.resolve();
  }
  
  private setupPresenceChannel(username: string) {
    if (this.presenceChannel) {
      this.presenceChannel.unsubscribe();
    }
    
    // Create a channel for tracking user presence
    const channelName = 'online-users';
    console.log(`Setting up presence channel: ${channelName}`);
    
    this.presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    // Track user's online status
    this.presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = this.presenceChannel.presenceState();
      console.log('Presence state updated:', state);
      const onlineUsers = Object.keys(state).length;
      
      // Notify listeners about updated user count
      console.log(`Presence sync: ${onlineUsers} users online`);
      this.connectedUsersCountCallbacks.forEach(callback => callback(onlineUsers));
    });

    this.presenceChannel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      console.log(`User joined: ${key}`, newPresences);
      // Notify about presence changes
      this.fetchConnectedUsersCount();
    });

    this.presenceChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
      console.log(`User left: ${key}`, leftPresences);
      // Notify about presence changes
      this.fetchConnectedUsersCount();
    });

    // Subscribe to the channel and track presence
    this.presenceChannel.subscribe(async (status: string) => {
      console.log(`Presence channel subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        // Start tracking presence
        try {
          await this.presenceChannel.track({
            user_id: this.userId,
            username: this.username,
            online_at: new Date().toISOString(),
          });
          console.log('Presence tracking started');
        } catch (error) {
          console.error('Error tracking presence:', error);
        }
      }
    });
  }
  
  private setupRealtimeSubscriptions(): void {
    // Clean up existing subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Subscribe to messages where this user is a participant
    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, payload => {
        console.log('New message received:', payload.new);
        // Only process messages sent to this user
        const message = payload.new;
        const recipientId = message.recipient_id || this.convertConversationToRecipientId(message.conversation_id);
        
        if (message.sender_id !== this.userId) {
          this.handleNewMessage(message);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: 'is_deleted=eq.true'
      }, payload => {
        this.handleMessageDeleted(payload.new.id);
      })
      .subscribe(status => {
        console.log(`Messages subscription status: ${status}`);
      });
    
    // Subscribe to connected users count changes
    const usersSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, payload => {
        console.log('Users table change:', payload);
        this.fetchConnectedUsersCount();
      })
      .subscribe(status => {
        console.log(`Users subscription status: ${status}`);
      });
    
    this.subscriptions.push(messagesSubscription, usersSubscription);
    console.log('Realtime subscriptions set up');
  }
  
  // Helper method to extract recipient from conversation
  private async convertConversationToRecipientId(conversationId: string): Promise<string | null> {
    if (!conversationId || !this.userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', this.userId)
        .single();
        
      if (error || !data) return null;
      return data.user_id;
    } catch (err) {
      console.error('Error getting recipient from conversation:', err);
      return null;
    }
  }
  
  public async disconnect(): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    console.log('Disconnecting Supabase service');
    
    // Update user online status
    await updateUserOnlineStatus(this.userId, false);
    
    // Clean up presence tracking
    if (this.presenceChannel) {
      try {
        await this.presenceChannel.untrack();
        await this.presenceChannel.unsubscribe();
        this.presenceChannel = null;
        console.log('Presence tracking stopped');
      } catch (error) {
        console.error('Error stopping presence tracking:', error);
      }
    }
    
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // Update connection status
    this.updateConnectionStatus('disconnected');
    
    // Reset state
    this.userId = null;
    this.username = null;
    this.blockedUsersCache = {};
    
    console.log('Supabase disconnected');
    return Promise.resolve();
  }
  
  public async fetchConnectedUsersCount(): Promise<number> {
    try {
      // First try to get count via presence
      if (this.presenceChannel) {
        const state = this.presenceChannel.presenceState();
        console.log('Current presence state:', state);
        const presenceCount = Object.keys(state).length;
        console.log(`Presence channel shows ${presenceCount} users online`);
        
        if (presenceCount > 0) {
          // Notify listeners
          this.connectedUsersCountCallbacks.forEach(callback => 
            callback(presenceCount)
          );
          return presenceCount;
        }
      }
      
      // Fall back to database query if presence shows zero
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('is_online', true);
        
      if (error) throw error;
      
      // Log all online users for debugging
      console.log('Online users from DB:', data);
      
      const onlineCount = count || (data?.length || 0);
      console.log(`Database query shows ${onlineCount} users online`);
      
      // Notify listeners
      this.connectedUsersCountCallbacks.forEach(callback => 
        callback(onlineCount)
      );
      
      return onlineCount;
    } catch (error) {
      console.error('Error fetching connected users count:', error);
      return 0;
    }
  }
  
  private updateConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.connectionStatusCallbacks.forEach(callback => callback(status));
  }
  
  // Message handling
  private handleNewMessage(messageData: any): void {
    // Convert to the format expected by the application
    const message: ChatMessage = {
      id: messageData.id,
      content: messageData.content,
      sender: messageData.sender_name || 'Unknown',
      actualUsername: messageData.sender_name,
      senderId: this.toNumberId(messageData.sender_id),
      recipientId: this.toNumberId(this.userId || ''),
      timestamp: new Date(messageData.created_at),
      isImage: messageData.is_image || false,
      imageUrl: messageData.image_url,
      isBlurred: messageData.is_blurred || false,
      isVoiceMessage: messageData.is_voice_message || false,
      audioUrl: messageData.audio_url,
      isDeleted: messageData.is_deleted || false,
      replyToId: messageData.reply_to_id,
      translatedContent: messageData.translated_content,
      translatedLanguage: messageData.translated_language,
      isRead: messageData.is_read || false
    };
    
    console.log('Processing new message:', message);
    
    // Notify listeners
    this.messageCallbacks.forEach(callback => callback(message));
  }
  
  private handleMessageDeleted(messageId: string): void {
    // Notify listeners
    this.deleteCallbacks.forEach(callback => callback(messageId));
  }
  
  // Event Listeners
  public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): void {
    this.connectionStatusCallbacks.push(callback);
    // Immediately call with current status
    callback(this.connectionStatus);
  }
  
  public onConnectedUsersCountChanged(callback: (count: number) => void): void {
    this.connectedUsersCountCallbacks.push(callback);
    this.fetchConnectedUsersCount();
  }
  
  public onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }
  
  public offMessageReceived(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }
  
  public onMessageDeleted(callback: (messageId: string) => void): void {
    this.deleteCallbacks.push(callback);
  }
  
  public offMessageDeleted(callback: (messageId: string) => void): void {
    this.deleteCallbacks = this.deleteCallbacks.filter(cb => cb !== callback);
  }
  
  public onUserTyping(callback: (userId: number) => void): void {
    this.typingCallbacks.push(callback);
  }
  
  public offUserTyping(callback: (userId: number) => void): void {
    this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
  }
  
  // Message sending
  public async sendMessage(
    recipientId: number, 
    content: string, 
    actualUsername?: string,
    replyToId?: string,
    replyText?: string
  ): Promise<void> {
    if (!this.userId) {
      console.error('Cannot send message: No active user');
      return Promise.resolve();
    }
    
    if (await this.isUserBlocked(recipientId)) {
      console.log(`Cannot send message to blocked user ${recipientId}`);
      return Promise.resolve();
    }
    
    console.log(`Sending message to ${recipientId}: ${content}`);
    
    // First, ensure we have a conversation with this user
    const conversationId = await this.getOrCreateConversation(recipientId);
    if (!conversationId) {
      console.error('Failed to get or create conversation');
      return Promise.resolve();
    }
    
    // Create the message
    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: this.userId,
      sender_name: this.username || actualUsername || 'Unknown',
      content,
      created_at: new Date().toISOString(),
      is_read: false,
      is_deleted: false,
      reply_to_id: replyToId || null,
      reply_text: replyText || null,
      is_image: false,
      is_voice_message: false
    };
    
    try {
      console.log(`Inserting message:`, newMessage);
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log(`Message sent with ID: ${messageId}`);
      
      // Convert to ChatMessage format for local handling
      const chatMessage: ChatMessage = {
        id: messageId,
        content,
        sender: this.username || 'You',
        actualUsername: this.username,
        senderId: this.toNumberId(this.userId),
        recipientId,
        timestamp: new Date(),
        isRead: true,
        replyToId,
        replyText
      };
      
      // Simulate a synchronous response for the UI
      this.handleNewMessage(chatMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
    
    return Promise.resolve();
  }
  
  private async getOrCreateConversation(recipientId: number): Promise<string | null> {
    if (!this.userId) return null;
    
    // Convert the numeric ID to string for Supabase
    const recipientUuid = this.getUuidFromNumber(recipientId);
    console.log(`Getting/creating conversation between ${this.userId} and ${recipientUuid}`);
    
    // First get the recipient's conversations
    const { data: recipientConversations, error: recipientError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', recipientUuid);
      
    if (recipientError) {
      console.error('Error fetching recipient conversations:', recipientError);
      return null;
    }
    
    if (!recipientConversations || recipientConversations.length === 0) {
      // No conversations for recipient, create a new one
      console.log(`No conversations found for recipient ${recipientUuid}, creating new one`);
      return this.createNewConversation(recipientUuid);
    }
    
    // Get conversation IDs as an array
    const conversationIds = recipientConversations.map(c => c.conversation_id);
    console.log(`Found ${conversationIds.length} conversations for recipient`, conversationIds);
    
    // Check if any of those conversations include the current user
    const { data: existingConversations, error: fetchError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', this.userId)
      .in('conversation_id', conversationIds);
      
    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      return null;
    }
    
    // If conversation exists, return it
    if (existingConversations && existingConversations.length > 0) {
      console.log(`Found existing conversation: ${existingConversations[0].conversation_id}`);
      return existingConversations[0].conversation_id;
    }
    
    // Create new conversation if none exists
    console.log(`No existing conversation found, creating new one`);
    return this.createNewConversation(recipientUuid);
  }
  
  private async createNewConversation(recipientUuid: string): Promise<string | null> {
    if (!this.userId) return null;
    
    // Create new conversation
    const conversationId = uuidv4();
    console.log(`Creating new conversation with ID: ${conversationId}`);
    
    // Insert conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      return null;
    }
    
    // Add participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: conversationId,
          user_id: this.userId,
          created_at: new Date().toISOString()
        },
        {
          conversation_id: conversationId,
          user_id: recipientUuid,
          created_at: new Date().toISOString()
        }
      ]);
      
    if (participantsError) {
      console.error('Error adding conversation participants:', participantsError);
      return null;
    }
    
    console.log(`Conversation ${conversationId} created with participants ${this.userId} and ${recipientUuid}`);
    return conversationId;
  }
  
  // Helper to convert number IDs to UUIDs (temporary during migration)
  private getUuidFromNumber(id: number): string {
    // This is a simplified approach - in production you would map to real UUIDs
    // For demo purposes, we'll create a deterministic UUID from the number
    return `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}`;
  }

  // Modified method with synchronous version for UI use
  public isUserBlocked(userId: number): boolean {
    // Use cached result if available
    if (this.blockedUsersCache[userId] !== undefined) {
      return this.blockedUsersCache[userId];
    }
    
    // If no cache available, assume not blocked for UI responsiveness
    // and update the cache asynchronously
    this.updateBlockedUserCache(userId);
    return false;
  }
  
  // Asynchronous version for backend operations
  public async checkIfUserBlocked(userId: number): Promise<boolean> {
    if (!this.userId) return false;
    
    // Use cached result if available to avoid DB queries
    if (this.blockedUsersCache[userId] !== undefined) {
      return this.blockedUsersCache[userId];
    }
    
    const blockedId = this.getUuidFromNumber(userId);
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', this.userId)
        .eq('blocked_id', blockedId);
        
      if (error) throw error;
      
      // Update cache
      const isBlocked = data && data.length > 0;
      this.blockedUsersCache[userId] = isBlocked;
      
      return isBlocked;
    } catch (error) {
      console.error('Error checking blocked status:', error);
      return false;
    }
  }
  
  // Helper method to update cache asynchronously
  private async updateBlockedUserCache(userId: number): Promise<void> {
    const isBlocked = await this.checkIfUserBlocked(userId);
    this.blockedUsersCache[userId] = isBlocked;
  }
  
  public async blockUser(userId: number): Promise<void> {
    if (!this.userId) return;
    
    const blockedId = this.getUuidFromNumber(userId);
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: this.userId,
          blocked_id: blockedId,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Update cache
      this.blockedUsersCache[userId] = true;
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }
  
  public async unblockUser(userId: number): Promise<void> {
    if (!this.userId) return;
    
    const blockedId = this.getUuidFromNumber(userId);
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', this.userId)
        .eq('blocked_id', blockedId);
        
      if (error) throw error;
      
      // Update cache
      this.blockedUsersCache[userId] = false;
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }
  
  public async getBlockedUsers(): Promise<number[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', this.userId);
        
      if (error) throw error;
      
      // Convert back to numbers for compatibility
      const blockedUsers = (data || []).map(item => this.toNumberId(item.blocked_id));
      
      // Update cache for all blocked users
      blockedUsers.forEach(id => {
        this.blockedUsersCache[id] = true;
      });
      
      return blockedUsers;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      return [];
    }
  }
  
  // Additional methods for user management
  public isAdminUser(userId: number): boolean {
    // This would need to check the user's role in the database
    // For now, return a simple check for admin ID
    return userId === 999; // Same logic as before for compatibility
  }
  
  // These are simpler implementations of the required methods
  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    // Get conversation
    const conversationId = await this.getOrCreateConversation(recipientId);
    if (!conversationId) return Promise.resolve();
    
    // Create message record
    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: this.userId,
      sender_name: this.username || 'Unknown',
      content: 'Sent an image',
      created_at: new Date().toISOString(),
      is_read: false,
      is_deleted: false,
      is_image: true,
      image_url: imageUrl,
      is_blurred: isBlurred
    };
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      // Handle for local UI
      this.handleNewMessage(newMessage);
    } catch (error) {
      console.error('Error sending image:', error);
    }
    
    return Promise.resolve();
  }
  
  public async sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    // Get conversation
    const conversationId = await this.getOrCreateConversation(recipientId);
    if (!conversationId) return Promise.resolve();
    
    // Create message record
    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: this.userId,
      sender_name: this.username || 'Unknown',
      content: 'Sent a voice message',
      created_at: new Date().toISOString(),
      is_read: false,
      is_deleted: false,
      is_voice_message: true,
      audio_url: audioUrl
    };
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      // Handle for local UI
      this.handleNewMessage(newMessage);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
    
    return Promise.resolve();
  }
  
  public async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', this.userId);
        
      if (error) throw error;
      
      // Notify about deletion
      this.deleteCallbacks.forEach(callback => callback(messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
    
    return Promise.resolve();
  }
  
  public sendTypingIndication(recipientId: number): void {
    // In a full implementation, this would send a typing event through real-time presence
    this.typingCallbacks.forEach(callback => callback(recipientId));
  }
  
  public async markMessagesAsRead(senderId: number): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    try {
      // Convert senderId to UUID format
      const senderUuid = this.getUuidFromNumber(senderId);
      
      // Find conversations with sender
      const { data: conversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.userId);
        
      if (convError || !conversations) return Promise.resolve();
      
      const conversationIds = conversations.map(c => c.conversation_id);
      
      // Update messages
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderUuid)
        .in('conversation_id', conversationIds)
        .eq('is_read', false);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
    
    return Promise.resolve();
  }
  
  public async getChatHistory(userId: number): Promise<ChatMessage[]> {
    if (!this.userId) return [];
    
    const recipientUuid = this.getUuidFromNumber(userId);
    
    try {
      // Find conversations with recipient
      const { data: conversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recipientUuid);
        
      if (convError || !conversations || conversations.length === 0) return [];
      
      const conversationIds = conversations.map(c => c.conversation_id);
      
      // Find conversations the current user is also part of
      const { data: myConversations, error: myConvError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.userId)
        .in('conversation_id', conversationIds);
        
      if (myConvError || !myConversations || myConversations.length === 0) return [];
      
      const sharedConversationIds = myConversations.map(c => c.conversation_id);
      
      // Get messages from these conversations
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', sharedConversationIds)
        .order('created_at', { ascending: true });
        
      if (msgError || !messages) return [];
      
      // Get participant information for determining recipientId
      const { data: participantsData, error: partError } = await supabase
        .from('conversation_participants')
        .select('user_id, conversation_id')
        .in('conversation_id', sharedConversationIds);
        
      if (partError || !participantsData) return [];
      
      // Convert to ChatMessage format
      return messages.map(msg => {
        // Find the other participant in this conversation
        const otherParticipants = participantsData.filter(p => 
          p.conversation_id === msg.conversation_id && p.user_id !== this.userId
        );
        
        // Default to first participant or empty string if none found
        const otherParticipantId = otherParticipants.length > 0 ? otherParticipants[0].user_id : '';
        
        return {
          id: msg.id,
          content: msg.content,
          sender: msg.sender_name,
          actualUsername: msg.sender_name,
          senderId: this.toNumberId(msg.sender_id),
          recipientId: this.toNumberId(this.userId === msg.sender_id ? otherParticipantId : this.userId || ''),
          timestamp: new Date(msg.created_at),
          isImage: msg.is_image || false,
          imageUrl: msg.image_url,
          isBlurred: msg.is_blurred || false,
          isVoiceMessage: msg.is_voice_message || false,
          audioUrl: msg.audio_url,
          isDeleted: msg.is_deleted || false,
          replyToId: msg.reply_to_id,
          replyText: msg.reply_text,
          translatedContent: msg.translated_content,
          translatedLanguage: msg.translated_language,
          isRead: msg.is_read || false
        };
      });
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }
  
  public async getAllChatHistory(): Promise<Record<number, ChatMessage[]>> {
    if (!this.userId) return {};
    
    try {
      // Find all conversations for the current user
      const { data: conversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.userId);
        
      if (convError || !conversations || conversations.length === 0) return {};
      
      const conversationIds = conversations.map(c => c.conversation_id);
      
      // Get all messages from these conversations
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true });
        
      if (msgError || !messages) return {};
      
      // Get other participants for each conversation
      const result: Record<number, ChatMessage[]> = {};
      
      for (const conversationId of conversationIds) {
        const { data: participants, error: partError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversationId)
          .neq('user_id', this.userId);
          
        if (partError || !participants || participants.length === 0) continue;
        
        // Get the other participant's ID
        const otherUserId = this.toNumberId(participants[0].user_id);
        
        // Filter messages for this conversation
        const conversationMessages = messages
          .filter(msg => msg.conversation_id === conversationId)
          .map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender_name,
            actualUsername: msg.sender_name,
            senderId: this.toNumberId(msg.sender_id),
            recipientId: this.toNumberId(this.userId === msg.sender_id ? participants[0].user_id : this.userId || ''),
            timestamp: new Date(msg.created_at),
            isImage: msg.is_image || false,
            imageUrl: msg.image_url,
            isBlurred: msg.is_blurred || false,
            isVoiceMessage: msg.is_voice_message || false,
            audioUrl: msg.audio_url,
            isDeleted: msg.is_deleted || false,
            replyToId: msg.reply_to_id,
            replyText: msg.reply_text,
            translatedContent: msg.translated_content,
            translatedLanguage: msg.translated_language,
            isRead: msg.is_read || false
          }));
          
        result[otherUserId] = conversationMessages;
      }
      
      return result;
    } catch (error) {
      console.error('Error getting all chat history:', error);
      return {};
    }
  }
  
  public async clearAllChatHistory(): Promise<void> {
    // Implementation would delete all messages for this user
    return Promise.resolve();
  }
  
  public async reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    try {
      const reportData = {
        id: uuidv4(),
        reporter_id: this.getUuidFromNumber(reporterId),
        reporter_name: reporterName,
        reported_id: this.getUuidFromNumber(reportedId),
        reported_name: reportedName,
        reason,
        details,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      
      const { error } = await supabase
        .from('user_reports')
        .insert(reportData);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error reporting user:', error);
    }
    
    return Promise.resolve();
  }
  
  public async getReports(): Promise<UserReport[]> {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map(report => ({
        id: report.id,
        reporterId: this.toNumberId(report.reporter_id),
        reporterName: report.reporter_name,
        reportedId: this.toNumberId(report.reported_id),
        reportedName: report.reported_name,
        reason: report.reason,
        details: report.details || '',
        timestamp: new Date(report.created_at),
        status: report.status as "pending" | "reviewed" | "dismissed"
      }));
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }
  
  public async deleteReport(reportId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_reports')
        .delete()
        .eq('id', reportId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting report:', error);
    }
    
    return Promise.resolve();
  }
  
  // Other stub methods from the original
  public async getBannedWords(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('banned_words')
        .select('word');
        
      if (error) throw error;
      
      return (data || []).map(row => row.word);
    } catch (error) {
      console.error('Error getting banned words:', error);
      return [];
    }
  }
  
  public async addBannedWord(word: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('banned_words')
        .insert({ word });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error adding banned word:', error);
    }
    
    return Promise.resolve();
  }
  
  public async removeBannedWord(word: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('banned_words')
        .delete()
        .eq('word', word);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error removing banned word:', error);
    }
    
    return Promise.resolve();
  }
  
  public async setBannedWords(words: string[]): Promise<void> {
    try {
      // Delete all existing words
      await supabase
        .from('banned_words')
        .delete()
        .not('id', 'is', null); // Delete all records
        
      // Add new words
      if (words.length > 0) {
        const wordObjects = words.map(word => ({ word }));
        await supabase
          .from('banned_words')
          .insert(wordObjects);
      }
    } catch (error) {
      console.error('Error setting banned words:', error);
    }
    
    return Promise.resolve();
  }
}

export const supabaseService = new SupabaseService();
