import { supabase } from "@/lib/supabase";
import { ChatMessage } from "./signalR/types";
import { setupUserPresence, subscribeToConversation } from "@/lib/supabase/realtime";

type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

type DatabaseMessage = {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type: string;
  media_url: string | null;
};

class SupabaseService {
  private userId: string | null = null;
  private username: string | null = null;
  private blockedUsers: Set<number> = new Set();
  private connectedUsersCountCallbacks: ((count: number) => void)[] = [];
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((userId: number, isTyping: boolean) => void)[] = [];
  private userStatusCallbacks: ((userId: number, isOnline: boolean) => void)[] = [];
  private presenceChannel: any = null;
  private messageSubscriptions: Map<string, any> = new Map();
  private currentUserConversation: string | null = null;
  
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      return { data, error };
    } catch (err) {
      console.error('Test connection error:', err);
      return { data: null, error: err as any };
    }
  }

  async initialize(userId: string, username: string): Promise<void> {
    this.userId = userId;
    this.username = username;
    
    console.log(`Initializing Supabase service for user ${username} (ID: ${userId})`);
    
    try {
      await this.updateOnlineStatus(true);
      
      this.setupRealtimePresence();
      
      await this.loadBlockedUsers();
      
      console.log(`Supabase service initialized for user ${username}`);
    } catch (err) {
      console.error('Error initializing Supabase service:', err);
      throw err;
    }
  }
  
  private async updateOnlineStatus(isOnline: boolean): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_online: isOnline, 
          last_active: new Date().toISOString() 
        })
        .eq('id', this.userId);
        
      if (error) {
        console.error('Error updating online status:', error);
      }
    } catch (err) {
      console.error('Error updating online status:', err);
    }
  }
  
  private setupRealtimePresence(): void {
    if (!this.userId) return;
    
    if (this.presenceChannel) {
      this.presenceChannel.unsubscribe();
    }
    
    this.presenceChannel = setupUserPresence(
      this.userId, 
      (userId, isOnline) => {
        const numericId = parseInt(userId);
        if (!isNaN(numericId)) {
          this.userStatusCallbacks.forEach(callback => callback(numericId, isOnline));
        }
      }
    );
  }
  
  private async loadBlockedUsers(): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', this.userId);
        
      if (error) {
        console.error('Error loading blocked users:', error);
        return;
      }
      
      this.blockedUsers.clear();
      if (data) {
        data.forEach(item => {
          const numericId = parseInt(item.blocked_id);
          if (!isNaN(numericId)) {
            this.blockedUsers.add(numericId);
          }
        });
      }
      
      console.log(`Loaded ${this.blockedUsers.size} blocked users`);
    } catch (err) {
      console.error('Exception loading blocked users:', err);
    }
  }
  
  async disconnect(): Promise<void> {
    if (!this.userId) return;
    
    try {
      console.log(`Disconnecting user ${this.username} (${this.userId})`);
      
      await this.updateOnlineStatus(false);
      
      if (this.presenceChannel) {
        this.presenceChannel.unsubscribe();
        this.presenceChannel = null;
      }
      
      this.messageSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.messageSubscriptions.clear();
      
      this.userId = null;
      this.username = null;
      this.blockedUsers.clear();
      this.currentUserConversation = null;
      
      console.log('Supabase service disconnected');
    } catch (err) {
      console.error('Error disconnecting from Supabase:', err);
      throw err;
    }
  }
  
  async ensureConversationExists(otherUserId: string): Promise<string> {
    if (!this.userId) throw new Error('User not initialized');
    
    try {
      console.log(`Ensuring conversation exists between users ${this.userId} and ${otherUserId}`);
      
      const { data: existingConversations, error: findError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', this.userId);
      
      if (findError) {
        console.error('Error finding existing conversations:', findError);
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
        
        if (createError || !newConversation) {
          console.error('Error creating conversation:', createError);
          throw createError || new Error('Failed to create conversation');
        }
        
        console.log(`Created new conversation: ${newConversation.id}`);
        
        const { error: insertError1 } = await supabase
          .from('conversation_participants')
          .insert({ user_id: this.userId, conversation_id: newConversation.id });
          
        const { error: insertError2 } = await supabase
          .from('conversation_participants')
          .insert({ user_id: otherUserId, conversation_id: newConversation.id });
        
        if (insertError1 || insertError2) {
          console.error('Error adding participant(s):', insertError1 || insertError2);
        }
        
        this.currentUserConversation = newConversation.id;
        this.subscribeToMessages(newConversation.id);
        return newConversation.id;
      }
      
      if (existingConversations && existingConversations.length > 0) {
        for (const participant of existingConversations) {
          const { data: otherParticipants, error: participantError } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', participant.conversation_id)
            .eq('user_id', otherUserId);
          
          if (!participantError && otherParticipants && otherParticipants.length > 0) {
            this.currentUserConversation = participant.conversation_id;
            this.subscribeToMessages(participant.conversation_id);
            console.log(`Found existing conversation: ${participant.conversation_id}`);
            return participant.conversation_id;
          }
        }
      }
      
      console.log('No existing conversation found, creating new one');
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
      
      if (createError || !newConversation) {
        console.error('Error creating conversation:', createError);
        throw createError || new Error('Failed to create conversation');
      }
      
      console.log(`Created new conversation: ${newConversation.id}`);
      
      const { error: insertError1 } = await supabase
        .from('conversation_participants')
        .insert({ user_id: this.userId, conversation_id: newConversation.id });
        
      const { error: insertError2 } = await supabase
        .from('conversation_participants')
        .insert({ user_id: otherUserId, conversation_id: newConversation.id });
      
      if (insertError1 || insertError2) {
        console.error('Error adding participant(s):', insertError1 || insertError2);
      }
      
      this.currentUserConversation = newConversation.id;
      this.subscribeToMessages(newConversation.id);
      return newConversation.id;
    } catch (err) {
      console.error('Error ensuring conversation exists:', err);
      const fallbackId = `fallback-${Date.now()}`;
      console.log(`Using fallback conversation ID: ${fallbackId}`);
      this.currentUserConversation = fallbackId;
      return fallbackId;
    }
  }
  
  private subscribeToMessages(conversationId: string): void {
    if (this.messageSubscriptions.has(conversationId)) {
      this.messageSubscriptions.get(conversationId)?.unsubscribe();
    }
    
    const subscription = subscribeToConversation(
      conversationId,
      (message) => {
        const chatMessage: ChatMessage = {
          id: message.id,
          content: message.content,
          sender: message.sender_id,
          recipientId: parseInt(this.userId || '0'),
          senderId: parseInt(message.sender_id),
          timestamp: new Date(message.created_at),
          isRead: message.is_read,
          status: 'delivered',
          isImage: message.is_image,
          imageUrl: message.image_url || undefined,
          audioUrl: message.audio_url || undefined
        };
        
        this.messageCallbacks.forEach(callback => callback(chatMessage));
      }
    );
    
    this.messageSubscriptions.set(conversationId, subscription);
  }
  
  async sendMessage(receiverId: number, content: string, messageType: string = 'text', mediaUrl?: string): Promise<boolean> {
    if (!this.userId || !this.username) return false;
    
    try {
      console.log(`Sending ${messageType} message to user ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const conversationId = await this.ensureConversationExists(receiverId.toString());
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          content: content,
          conversation_id: conversationId,
          is_read: false,
          sender_name: this.username,
          message_type: messageType,
          media_url: mediaUrl,
        });
        
      if (error) {
        console.error('Error sending message:', error);
        return false;
      }
      
      console.log('Message sent successfully');
      return true;
    } catch (err) {
      console.error('Exception sending message:', err);
      return false;
    }
  }
  
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
        
      if (error) {
        console.error('Error marking message as read:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception marking message as read:', err);
      return false;
    }
  }
  
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId);
        
      if (error) {
        console.error('Error marking message as deleted:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception deleting message:', err);
      return false;
    }
  }
  
  async blockUser(userId: number): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: this.userId,
          blocked_id: userId.toString(),
        });
        
      if (error) {
        console.error('Error blocking user:', error);
        return false;
      }
      
      this.blockedUsers.add(userId);
      console.log(`User ${userId} blocked`);
      return true;
    } catch (err) {
      console.error('Exception blocking user:', err);
      return false;
    }
  }
  
  async unblockUser(userId: number): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', this.userId)
        .eq('blocked_id', userId.toString());
        
      if (error) {
        console.error('Error unblocking user:', error);
        return false;
      }
      
      this.blockedUsers.delete(userId);
      console.log(`User ${userId} unblocked`);
      return true;
    } catch (err) {
      console.error('Exception unblocking user:', err);
      return false;
    }
  }
  
  isUserBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }
  
  async reportUser(userId: number, reason: string): Promise<boolean> {
    if (!this.userId || !this.username) return false;
    
    try {
      const { data: reportedUser, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId.toString())
        .single();
        
      if (userError || !reportedUser) {
        console.error('Error fetching reported user:', userError);
        return false;
      }
      
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: this.userId,
          reported_id: userId.toString(),
          reason: reason,
          reporter_name: this.username,
          reported_name: reportedUser.username,
          details: reason,
          status: 'pending',
        });
        
      if (error) {
        console.error('Error reporting user:', error);
        return false;
      }
      
      console.log(`User ${userId} reported for: ${reason}`);
      return true;
    } catch (err) {
      console.error('Exception reporting user:', err);
      return false;
    }
  }
  
  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    if (!this.userId) return [];
    
    try {
      console.log(`Fetching chat history with user ${userId}`);
      
      try {
        const conversationId = await this.ensureConversationExists(userId.toString());
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching chat history:', error);
          return [];
        }
        
        const messages: ChatMessage[] = (data || []).map(msg => ({
          id: msg.id,
          senderId: parseInt(msg.sender_id),
          recipientId: parseInt(this.userId || '0'),
          sender: msg.sender_name,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          isRead: msg.is_read,
          status: 'delivered',
          isImage: msg.is_image,
          imageUrl: msg.image_url || undefined,
          audioUrl: msg.audio_url || undefined,
          isDeleted: msg.is_deleted
        }));
        
        console.log(`Retrieved ${messages.length} messages with user ${userId}`);
        return messages;
      } catch (err) {
        console.error('Error finding/creating conversation:', err);
        return [];
      }
    } catch (err) {
      console.error('Exception fetching chat history:', err);
      return [];
    }
  }
  
  async fetchConnectedUsersCount(): Promise<number> {
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_online', true);
        
      if (error) {
        console.error('Error fetching connected users count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (err) {
      console.error('Exception fetching connected users count:', err);
      return 0;
    }
  }
  
  onMessage(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }
  
  onTyping(callback: (userId: number, isTyping: boolean) => void): void {
    this.typingCallbacks.push(callback);
  }
  
  onUserStatusChanged(callback: (userId: number, isOnline: boolean) => void): void {
    this.userStatusCallbacks.push(callback);
  }
  
  onConnectedUsersCountChanged(callback: (count: number) => void): void {
    this.connectedUsersCountCallbacks.push(callback);
    
    this.fetchConnectedUsersCount()
      .then(count => callback(count))
      .catch(err => console.error('Error in initial count fetch:', err));
  }
  
  async setTyping(receiverId: number, isTyping: boolean): Promise<void> {
    if (!this.userId || !this.presenceChannel) return;
    
    try {
      await this.presenceChannel.track({
        online_at: new Date().toISOString(),
        username: this.userId,
        typing_to: isTyping ? receiverId.toString() : null
      });
      
      console.log(`User ${this.username} is ${isTyping ? 'typing to' : 'stopped typing to'} user ${receiverId}`);
    } catch (err) {
      console.error('Error updating typing status:', err);
    }
  }
  
  async getAllChatHistory(): Promise<ChatMessage[]> {
    if (!this.userId) return [];
    
    try {
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversation:conversation_id(*)
        `)
        .eq('user_id', this.userId);
        
      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return [];
      }
      
      if (!conversations || conversations.length === 0) {
        return [];
      }
      
      const conversationIds = conversations.map(c => c.conversation_id);
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });
        
      if (messagesError) {
        console.error('Error fetching all messages:', messagesError);
        return [];
      }
      
      const allMessages: ChatMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        senderId: parseInt(msg.sender_id),
        recipientId: parseInt(this.userId || '0'),
        sender: msg.sender_name,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        isRead: msg.is_read,
        status: 'delivered',
        isImage: msg.is_image,
        imageUrl: msg.image_url || undefined,
        audioUrl: msg.audio_url || undefined,
        isDeleted: msg.is_deleted
      }));
      
      return allMessages;
    } catch (err) {
      console.error('Error fetching all chat history:', err);
      return [];
    }
  }
  
  async getBlockedUsers(): Promise<any[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          blocked_id,
          blocked_user:blocked_id(
            username,
            id
          )
        `)
        .eq('blocker_id', this.userId);
        
      if (error) {
        console.error('Error fetching blocked users:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Exception fetching blocked users:', err);
      return [];
    }
  }
  
  getBlockedUserIds(): number[] {
    return Array.from(this.blockedUsers);
  }
  
  get currentUserId(): number {
    return this.userId ? parseInt(this.userId) : 0;
  }
}

export const supabaseService = new SupabaseService();
