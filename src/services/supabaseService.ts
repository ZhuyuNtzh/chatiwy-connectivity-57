import { supabase } from "@/lib/supabase";
import { ChatMessage } from "./signalR/types";

class SupabaseService {
  private userId: string | null = null;
  private username: string | null = null;
  private blockedUsers: Set<number> = new Set();
  private connectedUsersCountCallbacks: ((count: number) => void)[] = [];
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((userId: number, isTyping: boolean) => void)[] = [];
  private userStatusCallbacks: ((userId: number, isOnline: boolean) => void)[] = [];
  private subscription: any = null;

  async initialize(userId: string, username: string): Promise<void> {
    this.userId = userId;
    this.username = username;
    
    console.log(`Initializing Supabase service for user ${username} (ID: ${userId})`);
    
    try {
      // Update user's online status
      const { error } = await supabase
        .from('users')
        .update({ is_online: true, last_active: new Date().toISOString() })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating online status:', error);
      }
      
      // Set up realtime subscription for messages
      this.setupRealtimeSubscription();
      
      // Load blocked users
      await this.loadBlockedUsers();
      
      console.log(`Supabase service initialized for user ${username}`);
    } catch (err) {
      console.error('Error initializing Supabase service:', err);
      throw err;
    }
  }
  
  private async setupRealtimeSubscription(): Promise<void> {
    if (!this.userId) return;
    
    try {
      // Clean up existing subscription if any
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      
      // Subscribe to messages table changes
      this.subscription = supabase
        .channel('messages-channel')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' }, 
          this.handleNewMessage.bind(this)
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'users' },
          this.handleUserStatusChange.bind(this)
        )
        .subscribe();
        
      console.log('Realtime subscription set up');
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }
  }
  
  private handleNewMessage(payload: any): void {
    const message = payload.new;
    
    // Only process messages for this user
    if (message.receiver_id === this.userId || message.sender_id === this.userId) {
      console.log('New message received:', message);
      
      // Convert to ChatMessage format
      const chatMessage: ChatMessage = {
        id: message.id,
        senderId: parseInt(message.sender_id),
        receiverId: parseInt(message.receiver_id),
        content: message.content,
        timestamp: new Date(message.created_at),
        isRead: message.is_read,
        messageType: message.message_type || 'text',
        mediaUrl: message.media_url || null,
      };
      
      // Notify all callbacks
      this.messageCallbacks.forEach(callback => callback(chatMessage));
    }
  }
  
  private handleUserStatusChange(payload: any): void {
    const user = payload.new;
    
    // Notify about user status change
    if (user && user.id !== this.userId) {
      console.log(`User ${user.username} (${user.id}) status changed: ${user.is_online ? 'online' : 'offline'}`);
      this.userStatusCallbacks.forEach(callback => 
        callback(parseInt(user.id), user.is_online)
      );
    }
  }
  
  private async loadBlockedUsers(): Promise<void> {
    if (!this.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', this.userId);
        
      if (error) {
        console.error('Error loading blocked users:', error);
        return;
      }
      
      // Clear and refill blocked users set
      this.blockedUsers.clear();
      if (data) {
        data.forEach(item => this.blockedUsers.add(parseInt(item.blocked_user_id)));
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
      
      // Update user's online status
      const { error } = await supabase
        .from('users')
        .update({ 
          is_online: false, 
          last_active: new Date().toISOString() 
        })
        .eq('id', this.userId);
        
      if (error) {
        console.error('Error updating offline status:', error);
      }
      
      // Clean up subscription
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
      
      // Clear user data
      this.userId = null;
      this.username = null;
      this.blockedUsers.clear();
      
      console.log('Supabase service disconnected');
    } catch (err) {
      console.error('Error disconnecting from Supabase:', err);
      throw err;
    }
  }
  
  async sendMessage(receiverId: number, content: string, messageType: string = 'text', mediaUrl?: string): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      console.log(`Sending ${messageType} message to user ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: this.userId,
          receiver_id: receiverId.toString(),
          content,
          message_type: messageType,
          media_url: mediaUrl,
          is_read: false,
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
  
  async markMessageAsRead(messageId: number): Promise<boolean> {
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
  
  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (error) {
        console.error('Error deleting message:', error);
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
          user_id: this.userId,
          blocked_user_id: userId.toString(),
        });
        
      if (error) {
        console.error('Error blocking user:', error);
        return false;
      }
      
      // Update local blocked users set
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
        .eq('user_id', this.userId)
        .eq('blocked_user_id', userId.toString());
        
      if (error) {
        console.error('Error unblocking user:', error);
        return false;
      }
      
      // Update local blocked users set
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
  
  async getBlockedUsers(): Promise<any[]> {
    if (!this.userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          blocked_user_id,
          blocked_users:blocked_user_id(
            username,
            avatar_url
          )
        `)
        .eq('user_id', this.userId);
        
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
  
  async reportUser(userId: number, reason: string): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: this.userId,
          reported_user_id: userId.toString(),
          reason,
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
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${this.userId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${this.userId})`)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }
      
      // Convert to ChatMessage format
      const messages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: parseInt(msg.sender_id),
        receiverId: parseInt(msg.receiver_id),
        content: msg.content,
        timestamp: new Date(msg.created_at),
        isRead: msg.is_read,
        messageType: msg.message_type || 'text',
        mediaUrl: msg.media_url || null,
      }));
      
      console.log(`Retrieved ${messages.length} messages with user ${userId}`);
      return messages;
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
    
    // Immediately fetch and provide the current count
    this.fetchConnectedUsersCount()
      .then(count => callback(count))
      .catch(err => console.error('Error in initial count fetch:', err));
  }
  
  async setTyping(receiverId: number, isTyping: boolean): Promise<void> {
    // For now, we don't persist typing status in Supabase
    // This would typically use a realtime presence channel
    console.log(`User ${this.username} is ${isTyping ? 'typing to' : 'stopped typing to'} user ${receiverId}`);
  }
  
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
}

export const supabaseService = new SupabaseService();
