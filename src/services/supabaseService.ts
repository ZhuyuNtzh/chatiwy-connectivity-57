
import { supabase } from '@/lib/supabase';
import { updateUserOnlineStatus, getOnlineUsers } from '@/lib/supabase';

// Use a typed interface for the ChatMessage
export interface ChatMessage {
  id: string;
  senderId: number | string;
  senderName: string;
  receiverId: number | string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isImage?: boolean;
  imageUrl?: string;
  isBlurred?: boolean;
  replyToId?: string;
  replyText?: string;
  isVoiceMessage?: boolean;
  audioUrl?: string;
  translatedContent?: string;
  translatedLanguage?: string;
}

// Use a typed interface for the UserReport
export interface UserReport {
  id: string;
  reporterId: number | string;
  reporterName: string;
  reportedId: number | string;
  reportedName: string;
  reason: string;
  details?: string;
  timestamp: Date;
  status: "pending" | "reviewed" | "dismissed";
}

// Use typed interface for UserProfile
export interface UserProfile {
  id: string | number;
  username: string;
  isOnline: boolean;
}

class SupabaseService {
  private userId: string = '';
  private username: string = '';
  private presenceChannel: any | null = null;
  private messageSubscriptions: any[] = [];
  private userCountListeners: ((count: number) => void)[] = [];
  private messageListeners: Map<number, ((message: ChatMessage) => void)[]> = new Map();
  private statusChangeListeners: ((userId: number, isOnline: boolean) => void)[] = [];
  private typingListeners: Map<number, ((isTyping: boolean) => void)[]> = new Map();
  private blockedUsers: Set<number> = new Set();
  private connectedUsersCache: UserProfile[] = [];

  // Initialize Supabase connection
  async initialize(userId: string, username: string): Promise<void> {
    console.log(`Initializing Supabase service for user ${username} (ID: ${userId})`);
    this.userId = userId;
    this.username = username;
    
    // Set user as online
    await this.setUserOnline(true);
    
    // Set up real-time presence channel
    await this.setupPresenceChannel();
    
    // Set up listeners for messages
    await this.setupMessageListeners();
    
    // Fetch any existing blocked users
    await this.fetchBlockedUsers();
    
    console.log("Supabase service initialization completed");
  }
  
  private async setupPresenceChannel(): Promise<void> {
    try {
      console.log("Setting up presence channel...");
      // Clean up any existing channel
      if (this.presenceChannel) {
        await supabase.removeChannel(this.presenceChannel);
      }
      
      // Create a new presence channel for all users
      this.presenceChannel = supabase.channel('online-users', {
        config: {
          presence: {
            key: this.userId,
          },
        },
      });
      
      // Track user state in presence channel
      this.presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = this.presenceChannel.presenceState();
          console.log("Presence sync:", state);
          this.updateConnectedUsers(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
          console.log(`User joined: ${key}`, newPresences);
          this.updateConnectedUsers(this.presenceChannel.presenceState());
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
          console.log(`User left: ${key}`, leftPresences);
          this.updateConnectedUsers(this.presenceChannel.presenceState());
        });
      
      // Subscribe to the channel and start tracking presence
      const status = await this.presenceChannel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to presence channel");
          // Track the user's presence
          const trackResult = await this.presenceChannel.track({
            username: this.username,
            online_at: new Date().toISOString(),
          });
          console.log("Presence tracking result:", trackResult);
        } else {
          console.log(`Presence channel status: ${status}`);
        }
      });
      
      console.log("Presence channel setup complete", status);
    } catch (error) {
      console.error("Error setting up presence channel:", error);
    }
  }
  
  private updateConnectedUsers(state: any): void {
    try {
      const users: UserProfile[] = [];
      
      // Process the presence state
      Object.keys(state).forEach(userId => {
        const userPresences = state[userId];
        if (Array.isArray(userPresences) && userPresences.length > 0) {
          // Get the most recent presence
          const presence = userPresences[0];
          if (presence && presence.username) {
            users.push({
              id: userId,
              username: presence.username,
              isOnline: true
            });
          }
        }
      });
      
      this.connectedUsersCache = users;
      const count = users.length;
      console.log(`Connected users updated: ${count} users online`);
      
      // Notify listeners about the updated count
      this.userCountListeners.forEach(listener => {
        listener(count);
      });
    } catch (error) {
      console.error("Error updating connected users:", error);
    }
  }
  
  private async setupMessageListeners(): Promise<void> {
    try {
      console.log("Setting up message listeners...");
      
      // Clean up any existing subscriptions
      this.messageSubscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
      this.messageSubscriptions = [];
      
      // Create a new subscription for messages
      const channel = supabase.channel('db-messages-changes');
      
      // Listen for new messages in the messages table
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${this.userId}`
        },
        (payload: any) => {
          console.log('New message received:', payload);
          if (payload.new) {
            const message = this.mapDbMessageToChatMessage(payload.new);
            this.notifyMessageListeners(Number(message.senderId), message);
          }
        }
      );
      
      // Subscribe to the channel
      const status = await channel.subscribe((status: string) => {
        console.log(`Message listeners subscription status: ${status}`);
      });
      
      // Save the subscription for cleanup
      this.messageSubscriptions.push(channel);
      
      console.log("Message listeners setup complete", status);
    } catch (error) {
      console.error("Error setting up message listeners:", error);
    }
  }
  
  private mapDbMessageToChatMessage(dbMessage: any): ChatMessage {
    return {
      id: dbMessage.id || '',
      senderId: dbMessage.sender_id || '',
      senderName: dbMessage.sender_name || '',
      receiverId: dbMessage.receiver_id || this.userId,
      content: dbMessage.content || '',
      timestamp: new Date(dbMessage.created_at || Date.now()),
      isRead: dbMessage.is_read || false,
      isImage: dbMessage.is_image || false,
      imageUrl: dbMessage.image_url || undefined,
      isBlurred: dbMessage.is_blurred || false,
      replyToId: dbMessage.reply_to_id || undefined,
      replyText: dbMessage.reply_text || undefined, 
      isVoiceMessage: dbMessage.is_voice_message || false,
      audioUrl: dbMessage.audio_url || undefined,
      translatedContent: dbMessage.translated_content || undefined,
      translatedLanguage: dbMessage.translated_language || undefined
    };
  }
  
  private notifyMessageListeners(senderId: number, message: ChatMessage): void {
    const listeners = this.messageListeners.get(senderId) || [];
    listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error(`Error notifying message listener for sender ${senderId}:`, error);
      }
    });
  }
  
  private async fetchBlockedUsers(): Promise<void> {
    try {
      console.log("Fetching blocked users...");
      
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', this.userId);
      
      if (error) {
        console.error("Error fetching blocked users:", error);
        return;
      }
      
      // Clear and update the blocked users set
      this.blockedUsers.clear();
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item && item.blocked_id) {
            this.blockedUsers.add(Number(item.blocked_id));
          }
        });
      }
      
      console.log(`Fetched ${this.blockedUsers.size} blocked users`);
    } catch (error) {
      console.error("Exception fetching blocked users:", error);
    }
  }
  
  // Disconnect and clean up
  async disconnect(): Promise<void> {
    console.log("Disconnecting from Supabase...");
    
    // Set user as offline
    await this.setUserOnline(false);
    
    // Clean up the presence channel
    if (this.presenceChannel) {
      try {
        await this.presenceChannel.untrack();
        await supabase.removeChannel(this.presenceChannel);
      } catch (error) {
        console.error("Error removing presence channel:", error);
      }
      this.presenceChannel = null;
    }
    
    // Clean up message subscriptions
    this.messageSubscriptions.forEach(subscription => {
      try {
        supabase.removeChannel(subscription);
      } catch (error) {
        console.error("Error removing message subscription:", error);
      }
    });
    this.messageSubscriptions = [];
    
    console.log("Disconnected from Supabase");
  }
  
  // Set user online status
  async setUserOnline(isOnline: boolean): Promise<void> {
    try {
      console.log(`Setting user ${this.username} (${this.userId}) online status to ${isOnline}`);
      await updateUserOnlineStatus(this.userId, isOnline);
    } catch (error) {
      console.error("Error setting user online status:", error);
    }
  }
  
  // Fetch connected users count
  async fetchConnectedUsersCount(): Promise<number> {
    try {
      // First check the presence cache
      if (this.connectedUsersCache.length > 0) {
        return this.connectedUsersCache.length;
      }
      
      // Fall back to database query
      const onlineUsers = await getOnlineUsers();
      return onlineUsers.length;
    } catch (error) {
      console.error("Error fetching connected users count:", error);
      return 0;
    }
  }
  
  // Listener for connected users count
  onConnectedUsersCountChanged(listener: (count: number) => void): void {
    this.userCountListeners.push(listener);
    
    // Immediately notify with current count
    const currentCount = this.connectedUsersCache.length;
    listener(currentCount);
  }
  
  // Listener for user status changes
  onUserStatusChanged(listener: (userId: number, isOnline: boolean) => void): void {
    this.statusChangeListeners.push(listener);
  }
  
  // Listener for new messages
  onMessage(senderId: number, listener: (message: ChatMessage) => void): void {
    if (!this.messageListeners.has(senderId)) {
      this.messageListeners.set(senderId, []);
    }
    this.messageListeners.get(senderId)!.push(listener);
  }
  
  // Listener for typing indicators
  onTypingIndicator(userId: number, listener: (isTyping: boolean) => void): void {
    if (!this.typingListeners.has(userId)) {
      this.typingListeners.set(userId, []);
    }
    this.typingListeners.get(userId)!.push(listener);
  }
  
  // Set typing indicator
  async setTypingIndicator(receiverId: number, isTyping: boolean): Promise<void> {
    try {
      // Use a real-time broadcast for typing indicators
      if (this.presenceChannel) {
        await this.presenceChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            senderId: this.userId,
            receiverId: receiverId.toString(),
            isTyping
          }
        });
      }
    } catch (error) {
      console.error("Error setting typing indicator:", error);
    }
  }
  
  // Send a message
  async sendMessage(receiverId: number, content: string): Promise<boolean> {
    try {
      console.log(`Sending message to user ${receiverId}: ${content}`);
      
      // Check if user is blocked
      if (this.isUserBlocked(receiverId)) {
        console.warn(`Cannot send message to blocked user ${receiverId}`);
        return false;
      }
      
      // Get or create conversation
      const conversationId = await this.getOrCreateConversation(receiverId);
      if (!conversationId) {
        console.error(`Failed to get or create conversation with user ${receiverId}`);
        return false;
      }
      
      // Insert message into the messages table
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          sender_name: this.username,
          conversation_id: conversationId,
          content: content,
          is_read: false
        });
      
      if (error) {
        console.error("Error sending message:", error);
        return false;
      }
      
      console.log(`Message sent successfully to user ${receiverId}`);
      return true;
    } catch (error) {
      console.error("Exception sending message:", error);
      return false;
    }
  }
  
  // Send an image message
  async sendImageMessage(receiverId: number, imageUrl: string, isBlurred: boolean = false): Promise<boolean> {
    try {
      console.log(`Sending image message to user ${receiverId}: ${imageUrl}`);
      
      // Check if user is blocked
      if (this.isUserBlocked(receiverId)) {
        console.warn(`Cannot send image to blocked user ${receiverId}`);
        return false;
      }
      
      // Get or create conversation
      const conversationId = await this.getOrCreateConversation(receiverId);
      if (!conversationId) {
        console.error(`Failed to get or create conversation with user ${receiverId}`);
        return false;
      }
      
      // Insert message into the messages table
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          sender_name: this.username,
          conversation_id: conversationId,
          is_image: true,
          image_url: imageUrl,
          is_blurred: isBlurred,
          is_read: false
        });
      
      if (error) {
        console.error("Error sending image message:", error);
        return false;
      }
      
      console.log(`Image message sent successfully to user ${receiverId}`);
      return true;
    } catch (error) {
      console.error("Exception sending image message:", error);
      return false;
    }
  }
  
  // Send a voice message
  async sendVoiceMessage(receiverId: number, audioUrl: string): Promise<boolean> {
    try {
      console.log(`Sending voice message to user ${receiverId}: ${audioUrl}`);
      
      // Check if user is blocked
      if (this.isUserBlocked(receiverId)) {
        console.warn(`Cannot send voice message to blocked user ${receiverId}`);
        return false;
      }
      
      // Get or create conversation
      const conversationId = await this.getOrCreateConversation(receiverId);
      if (!conversationId) {
        console.error(`Failed to get or create conversation with user ${receiverId}`);
        return false;
      }
      
      // Insert message into the messages table
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          sender_name: this.username,
          conversation_id: conversationId,
          is_voice_message: true,
          audio_url: audioUrl,
          is_read: false
        });
      
      if (error) {
        console.error("Error sending voice message:", error);
        return false;
      }
      
      console.log(`Voice message sent successfully to user ${receiverId}`);
      return true;
    } catch (error) {
      console.error("Exception sending voice message:", error);
      return false;
    }
  }
  
  // Reply to a message
  async replyToMessage(receiverId: number, content: string, replyToId: string, replyText: string): Promise<boolean> {
    try {
      console.log(`Replying to message ${replyToId} for user ${receiverId}: ${content}`);
      
      // Check if user is blocked
      if (this.isUserBlocked(receiverId)) {
        console.warn(`Cannot reply to blocked user ${receiverId}`);
        return false;
      }
      
      // Get or create conversation
      const conversationId = await this.getOrCreateConversation(receiverId);
      if (!conversationId) {
        console.error(`Failed to get or create conversation with user ${receiverId}`);
        return false;
      }
      
      // Insert reply message into the messages table
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          sender_name: this.username,
          conversation_id: conversationId,
          content: content,
          reply_to_id: replyToId,
          reply_text: replyText,
          is_read: false
        });
      
      if (error) {
        console.error("Error sending reply message:", error);
        return false;
      }
      
      console.log(`Reply message sent successfully to user ${receiverId}`);
      return true;
    } catch (error) {
      console.error("Exception sending reply message:", error);
      return false;
    }
  }
  
  // Unsend/delete a message
  async unsendMessage(messageId: string): Promise<boolean> {
    try {
      console.log(`Unsending message ${messageId}`);
      
      // Update the message as deleted
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', this.userId);
      
      if (error) {
        console.error("Error unsending message:", error);
        return false;
      }
      
      console.log(`Message ${messageId} unsent successfully`);
      return true;
    } catch (error) {
      console.error("Exception unsending message:", error);
      return false;
    }
  }
  
  // Get chat history for a specific user
  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    try {
      console.log(`Getting chat history for user ${userId}`);
      
      // Find conversation between the current user and the target user
      const conversationId = await this.getConversationId(userId);
      if (!conversationId) {
        console.log(`No conversation found with user ${userId}`);
        return [];
      }
      
      // Get participants to verify this user has access to this conversation
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);
      
      if (participantsError) {
        console.error("Error fetching conversation participants:", participantsError);
        return [];
      }
      
      // Check if current user is a participant
      const isParticipant = participants.some(p => p.user_id === this.userId);
      if (!isParticipant) {
        console.warn(`User ${this.userId} is not a participant in conversation ${conversationId}`);
        return [];
      }
      
      // Fetch messages for this conversation
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching chat history:", error);
        return [];
      }
      
      // Map database messages to ChatMessage format
      const messages: ChatMessage[] = (data || []).map(message => this.mapDbMessageToChatMessage(message));
      
      console.log(`Retrieved ${messages.length} messages from conversation with user ${userId}`);
      return messages;
    } catch (error) {
      console.error(`Exception getting chat history for user ${userId}:`, error);
      return [];
    }
  }
  
  // Get all chat histories
  async getAllChatHistory(): Promise<Record<number, ChatMessage[]>> {
    try {
      console.log("Getting all chat histories");
      
      // Find all conversations the current user is part of
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.userId);
      
      if (conversationsError) {
        console.error("Error fetching user conversations:", conversationsError);
        return {};
      }
      
      if (!conversations || conversations.length === 0) {
        console.log("No conversations found for the current user");
        return {};
      }
      
      // Get conversation IDs
      const conversationIds = conversations.map(c => c.conversation_id);
      
      // Fetch messages for these conversations
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error("Error fetching all messages:", messagesError);
        return {};
      }
      
      // Organize messages by sender/receiver
      const history: Record<number, ChatMessage[]> = {};
      
      (messages || []).forEach(message => {
        const chatMessage = this.mapDbMessageToChatMessage(message);
        const otherUserId = chatMessage.senderId === this.userId ? chatMessage.receiverId : chatMessage.senderId;
        
        if (!history[Number(otherUserId)]) {
          history[Number(otherUserId)] = [];
        }
        
        history[Number(otherUserId)].push(chatMessage);
      });
      
      console.log(`Retrieved chat histories for ${Object.keys(history).length} conversations`);
      return history;
    } catch (error) {
      console.error("Exception getting all chat histories:", error);
      return {};
    }
  }
  
  // Get or create a conversation with a user
  private async getOrCreateConversation(userId: number): Promise<string | null> {
    try {
      // First check if a conversation already exists
      const existingId = await this.getConversationId(userId);
      if (existingId) {
        return existingId;
      }
      
      // Create a new conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();
      
      if (conversationError || !conversation) {
        console.error("Error creating new conversation:", conversationError);
        return null;
      }
      
      const conversationId = conversation.id;
      
      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: this.userId },
          { conversation_id: conversationId, user_id: userId.toString() }
        ]);
      
      if (participantsError) {
        console.error("Error adding conversation participants:", participantsError);
        // Clean up the created conversation
        await supabase.from('conversations').delete().eq('id', conversationId);
        return null;
      }
      
      console.log(`Created new conversation ${conversationId} between users ${this.userId} and ${userId}`);
      return conversationId;
    } catch (error) {
      console.error(`Exception getting or creating conversation with user ${userId}:`, error);
      return null;
    }
  }
  
  // Get conversation ID between the current user and another user
  private async getConversationId(userId: number): Promise<string | null> {
    try {
      // Find conversations where the current user is a participant
      const { data: myConversations, error: myError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.userId);
      
      if (myError || !myConversations || myConversations.length === 0) {
        console.log(`No conversations found for user ${this.userId}`);
        return null;
      }
      
      // Get conversation IDs
      const conversationIds = myConversations.map(c => c.conversation_id);
      
      // Find conversations where the other user is also a participant
      const { data: otherUserConversations, error: otherError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId.toString())
        .in('conversation_id', conversationIds);
      
      if (otherError || !otherUserConversations || otherUserConversations.length === 0) {
        console.log(`No shared conversations found between users ${this.userId} and ${userId}`);
        return null;
      }
      
      // Return the first matching conversation ID
      return otherUserConversations[0].conversation_id;
    } catch (error) {
      console.error(`Exception getting conversation ID with user ${userId}:`, error);
      return null;
    }
  }
  
  // Block a user
  async blockUser(userId: number): Promise<boolean> {
    try {
      console.log(`Blocking user ${userId}`);
      
      // Insert into blocked_users table
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: this.userId,
          blocked_id: userId.toString()
        });
      
      if (error) {
        console.error("Error blocking user:", error);
        return false;
      }
      
      // Update local cache
      this.blockedUsers.add(userId);
      
      console.log(`User ${userId} blocked successfully`);
      return true;
    } catch (error) {
      console.error(`Exception blocking user ${userId}:`, error);
      return false;
    }
  }
  
  // Unblock a user
  async unblockUser(userId: number): Promise<boolean> {
    try {
      console.log(`Unblocking user ${userId}`);
      
      // Remove from blocked_users table
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', this.userId)
        .eq('blocked_id', userId.toString());
      
      if (error) {
        console.error("Error unblocking user:", error);
        return false;
      }
      
      // Update local cache
      this.blockedUsers.delete(userId);
      
      console.log(`User ${userId} unblocked successfully`);
      return true;
    } catch (error) {
      console.error(`Exception unblocking user ${userId}:`, error);
      return false;
    }
  }
  
  // Check if a user is blocked
  isUserBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }
  
  // Get blocked users
  async getBlockedUsers(): Promise<{ id: number; username: string }[]> {
    try {
      console.log("Getting blocked users");
      
      // Query blocked_users table
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', this.userId);
      
      if (error) {
        console.error("Error getting blocked users:", error);
        return [];
      }
      
      // Get user details for each blocked user
      const blockedUsers: { id: number; username: string }[] = [];
      
      for (const item of data || []) {
        if (item && item.blocked_id) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('username')
              .eq('id', item.blocked_id)
              .single();
            
            if (!userError && userData) {
              blockedUsers.push({
                id: Number(item.blocked_id),
                username: userData.username
              });
            }
          } catch (userError) {
            console.error(`Error getting details for blocked user ${item.blocked_id}:`, userError);
          }
        }
      }
      
      console.log(`Retrieved ${blockedUsers.length} blocked users`);
      return blockedUsers;
    } catch (error) {
      console.error("Exception getting blocked users:", error);
      return [];
    }
  }
  
  // Report a user
  async reportUser(userId: number, username: string, reason: string, details?: string): Promise<boolean> {
    try {
      console.log(`Reporting user ${userId} (${username}) for reason: ${reason}`);
      
      // Insert into user_reports table
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: this.userId,
          reporter_name: this.username,
          reported_id: userId.toString(),
          reported_name: username,
          reason: reason,
          details: details || '',
          status: 'pending'
        });
      
      if (error) {
        console.error("Error reporting user:", error);
        return false;
      }
      
      console.log(`User ${userId} (${username}) reported successfully`);
      return true;
    } catch (error) {
      console.error(`Exception reporting user ${userId}:`, error);
      return false;
    }
  }
  
  // Get reports (admin only)
  async getReports(): Promise<UserReport[]> {
    try {
      console.log("Getting user reports");
      
      // Query user_reports table
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error getting user reports:", error);
        return [];
      }
      
      // Map to UserReport interface
      const reports: UserReport[] = (data || []).map(report => ({
        id: report.id,
        reporterId: report.reporter_id,
        reporterName: report.reporter_name,
        reportedId: report.reported_id,
        reportedName: report.reported_name,
        reason: report.reason,
        details: report.details,
        timestamp: new Date(report.created_at),
        status: report.status as "pending" | "reviewed" | "dismissed"
      }));
      
      console.log(`Retrieved ${reports.length} user reports`);
      return reports;
    } catch (error) {
      console.error("Exception getting user reports:", error);
      return [];
    }
  }
  
  // Update report status (admin only)
  async updateReportStatus(reportId: string, status: "pending" | "reviewed" | "dismissed"): Promise<boolean> {
    try {
      console.log(`Updating report ${reportId} status to ${status}`);
      
      // Update user_reports table
      const { error } = await supabase
        .from('user_reports')
        .update({ status })
        .eq('id', reportId);
      
      if (error) {
        console.error("Error updating report status:", error);
        return false;
      }
      
      console.log(`Report ${reportId} status updated to ${status} successfully`);
      return true;
    } catch (error) {
      console.error(`Exception updating report ${reportId} status:`, error);
      return false;
    }
  }
  
  // Delete a conversation (for VIPs)
  async deleteConversation(userId: number): Promise<boolean> {
    try {
      console.log(`Deleting conversation with user ${userId}`);
      
      // Get conversation ID
      const conversationId = await this.getConversationId(userId);
      if (!conversationId) {
        console.log(`No conversation found with user ${userId}`);
        return false;
      }
      
      // Mark all messages as deleted
      const { error: messagesError } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('conversation_id', conversationId);
      
      if (messagesError) {
        console.error("Error marking conversation messages as deleted:", messagesError);
        return false;
      }
      
      console.log(`Conversation with user ${userId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Exception deleting conversation with user ${userId}:`, error);
      return false;
    }
  }
}

// Export a singleton instance
export const supabaseService = new SupabaseService();
