
import { supabase } from '@/lib/supabase';
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
    
    // Set up real-time subscriptions
    this.setupRealtimeSubscriptions();
    
    // Set up presence channel for online status
    this.setupPresenceChannel(username);
    
    // Update user online status in the database
    await this.updateUserOnlineStatus(true);
    
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
  
  private async updateUserOnlineStatus(isOnline: boolean): Promise<void> {
    if (!this.userId) return;
    
    try {
      // Check if user exists first
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', this.userId)
        .maybeSingle();
      
      if (existingUser) {
        // Update existing user
        console.log(`Updating online status for user ${this.userId} to ${isOnline}`);
        const { error } = await supabase
          .from('users')
          .update({ 
            is_online: isOnline,
            last_active: new Date().toISOString()
          })
          .eq('id', this.userId);
          
        if (error) throw error;
      } else {
        // Insert new user if they don't exist
        console.log(`Creating new user ${this.userId} with online status ${isOnline}`);
        const { error } = await supabase
          .from('users')
          .insert({ 
            id: this.userId,
            username: this.username,
            is_online: isOnline,
            role: 'standard',
            last_active: new Date().toISOString()
          });
          
        if (error) {
          // If insert fails due to primary key constraint, try update instead
          if (error.code === '23505') { // Duplicate key error
            console.log(`User ID ${this.userId} already exists, updating instead`);
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                username: this.username,
                is_online: isOnline,
                last_active: new Date().toISOString()
              })
              .eq('id', this.userId);
              
            if (updateError) throw updateError;
          } else {
            throw error;
          }
        }
      }
      
      console.log(`User online status updated to ${isOnline}`);
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }
  
  public async fetchConnectedUsersCount(): Promise<number> {
    try {
      // First try to get count via presence
      if (this.presenceChannel) {
        const state = this.presenceChannel.presenceState();
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
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);
        
      if (error) throw error;
      
      const onlineCount = count || 0;
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
        table: 'messages',
        filter: `sender_id=neq.${this.userId}`
      }, payload => {
        this.handleNewMessage(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: 'is_deleted=eq.true'
      }, payload => {
        this.handleMessageDeleted(payload.new.id);
      })
      .subscribe();
    
    // Subscribe to connected users count changes
    const usersSubscription = supabase
      .channel('public:users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: 'is_online=eq.true'
      }, () => {
        this.fetchConnectedUsersCount();
      })
      .subscribe();
    
    this.subscriptions.push(messagesSubscription, usersSubscription);
    console.log('Realtime subscriptions set up');
  }
  
  public async disconnect(): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    console.log('Disconnecting Supabase service');
    
    // Update user online status
    await this.updateUserOnlineStatus(false);
    
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
    if (!this.userId) return Promise.resolve();
    
    if (await this.isUserBlocked(recipientId)) {
      console.log(`Cannot send message to blocked user ${recipientId}`);
      return Promise.resolve();
    }
    
    // First, ensure we have a conversation with this user
    const conversationId = await this.getOrCreateConversation(recipientId);
    if (!conversationId) {
      console.error('Failed to get or create conversation');
      return Promise.resolve();
    }
    
    // Create the message
    const newMessage = {
      id: uuidv4(),
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
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      // Convert to ChatMessage format for local handling
      const chatMessage: ChatMessage = {
        id: newMessage.id,
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
      return this.createNewConversation(recipientUuid);
    }
    
    // Get conversation IDs as an array
    const conversationIds = recipientConversations.map(c => c.conversation_id);
    
    // Check if any of those conversations include the current user
    const { data: existingConversations, error: fetchError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(*)
      `)
      .eq('user_id', this.userId)
      .in('conversation_id', conversationIds);
      
    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      return null;
    }
    
    // If conversation exists, return it
    if (existingConversations && existingConversations.length > 0) {
      return existingConversations[0].conversation_id;
    }
    
    // Create new conversation if none exists
    return this.createNewConversation(recipientUuid);
  }
  
  private async createNewConversation(recipientUuid: string): Promise<string | null> {
    if (!this.userId) return null;
    
    // Create new conversation
    const conversationId = uuidv4();
    
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
  
  // These are placeholders that need proper implementation
  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public async sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public sendTypingIndication(recipientId: number): void {
    // Implementation needed
  }
  
  public async markMessagesAsRead(senderId: number): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public async getChatHistory(userId: number): Promise<ChatMessage[]> {
    // Implementation needed
    return [];
  }
  
  public async getAllChatHistory(): Promise<Record<number, ChatMessage[]>> {
    // Implementation needed
    return {};
  }
  
  public async clearAllChatHistory(): Promise<void> {
    // Implementation needed
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
    // Implementation needed
    return Promise.resolve();
  }
  
  public async getReports(): Promise<UserReport[]> {
    // Implementation needed
    return [];
  }
  
  public async deleteReport(reportId: string): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public async getBannedWords(): Promise<string[]> {
    // Implementation needed
    return [];
  }
  
  public async addBannedWord(word: string): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public async removeBannedWord(word: string): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
  
  public async setBannedWords(words: string[]): Promise<void> {
    // Implementation needed
    return Promise.resolve();
  }
}

export const supabaseService = new SupabaseService();
