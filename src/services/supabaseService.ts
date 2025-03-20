import { supabase } from "@/lib/supabase";
import { ChatMessage } from "./signalR/types";
import { setupUserPresence } from "@/lib/supabase/realtime";
import { registerUser } from "@/lib/supabase/users";
import { supabaseCore } from "./supabase/core";
import { supabaseUsers } from "./supabase/users";
import { supabaseMessaging } from "./supabase/messaging";
import { MessageCallback, TypingCallback, UserStatusCallback, UsersCountCallback } from "./supabase/types";

class SupabaseService {
  private userId: string | null = null;
  private username: string | null = null;
  private role: string | null = null;
  private blockedUsers: Set<number> = new Set();
  private connectedUsersCountCallbacks: UsersCountCallback[] = [];
  private messageCallbacks: MessageCallback[] = [];
  private typingCallbacks: TypingCallback[] = [];
  private userStatusCallbacks: UserStatusCallback[] = [];
  private presenceChannel: any = null;
  private messageSubscriptions: Map<string, any> = new Map();
  private currentUserConversation: string | null = null;
  
  async testConnection() {
    return supabaseCore.testConnection();
  }

  async initialize(userId: string, username: string, role: string = 'standard'): Promise<void> {
    this.userId = userId;
    this.username = username;
    this.role = role;
    
    console.log(`Initializing Supabase service for user ${username} (ID: ${userId}, role: ${role})`);
    
    try {
      await supabaseCore.updateOnlineStatus(userId, true);
      
      this.presenceChannel = supabaseUsers.setupRealtimePresence(
        userId,
        username,
        (changedUserId, isOnline) => {
          const numericId = parseInt(changedUserId);
          if (!isNaN(numericId)) {
            this.userStatusCallbacks.forEach(callback => callback(numericId, isOnline));
          }
        }
      );
      
      // Re-register the user to ensure they exist
      await registerUser(userId, username, role);
      
      this.blockedUsers = await supabaseUsers.loadBlockedUsers(userId);
      
      console.log(`Supabase service initialized for user ${username}`);
    } catch (err) {
      console.error('Error initializing Supabase service:', err);
      throw err;
    }
  }
  
  async disconnect(): Promise<void> {
    if (!this.userId) return;
    
    try {
      console.log(`Disconnecting user ${this.username} (${this.userId})`);
      
      await supabaseCore.updateOnlineStatus(this.userId, false);
      
      if (this.presenceChannel) {
        supabase.removeChannel(this.presenceChannel);
        this.presenceChannel = null;
      }
      
      this.messageSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
      this.messageSubscriptions.clear();
      
      this.userId = null;
      this.username = null;
      this.role = null;
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
    
    const conversationId = await supabaseMessaging.ensureConversationExists(this.userId, otherUserId);
    this.currentUserConversation = conversationId;
    
    if (!this.messageSubscriptions.has(conversationId)) {
      const subscription = supabaseMessaging.subscribeToMessages(
        conversationId,
        (message) => {
          // Set the recipient to the current user
          message.recipientId = parseInt(this.userId || '0');
          this.messageCallbacks.forEach(callback => callback(message));
        }
      );
      
      this.messageSubscriptions.set(conversationId, subscription);
    }
    
    return conversationId;
  }
  
  async sendMessage(receiverId: number, content: string, messageType: string = 'text', mediaUrl?: string): Promise<boolean> {
    if (!this.userId || !this.username) return false;
    
    return supabaseMessaging.sendMessage(
      this.userId,
      this.username,
      receiverId,
      content,
      messageType,
      mediaUrl
    );
  }
  
  async markMessageAsRead(messageId: string): Promise<boolean> {
    return supabaseMessaging.markMessageAsRead(messageId);
  }
  
  async deleteMessage(messageId: string): Promise<boolean> {
    return supabaseMessaging.deleteMessage(messageId);
  }
  
  async blockUser(userId: number): Promise<boolean> {
    if (!this.userId) return false;
    
    const success = await supabaseUsers.blockUser(this.userId, userId);
    if (success) {
      this.blockedUsers.add(userId);
    }
    return success;
  }
  
  async unblockUser(userId: number): Promise<boolean> {
    if (!this.userId) return false;
    
    const success = await supabaseUsers.unblockUser(this.userId, userId);
    if (success) {
      this.blockedUsers.delete(userId);
    }
    return success;
  }
  
  isUserBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }
  
  async reportUser(userId: number, reason: string): Promise<boolean> {
    if (!this.userId || !this.username) return false;
    
    return supabaseUsers.reportUser(this.userId, this.username, userId, reason);
  }
  
  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    if (!this.userId) return [];
    
    return supabaseMessaging.getChatHistory(this.userId, userId);
  }
  
  async fetchConnectedUsersCount(): Promise<number> {
    const count = await supabaseUsers.fetchConnectedUsersCount();
    this.connectedUsersCountCallbacks.forEach(callback => callback(count));
    return count;
  }
  
  onMessage(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }
  
  onTyping(callback: TypingCallback): void {
    this.typingCallbacks.push(callback);
  }
  
  onUserStatusChanged(callback: UserStatusCallback): void {
    this.userStatusCallbacks.push(callback);
  }
  
  onConnectedUsersCountChanged(callback: UsersCountCallback): void {
    this.connectedUsersCountCallbacks.push(callback);
    
    this.fetchConnectedUsersCount()
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
    
    return supabaseMessaging.getAllChatHistory(this.userId);
  }
  
  async getBlockedUsers(): Promise<any[]> {
    if (!this.userId) return [];
    
    return supabaseUsers.getBlockedUsers(this.userId);
  }
  
  getBlockedUserIds(): number[] {
    return Array.from(this.blockedUsers);
  }
  
  get currentUserId(): number {
    return this.userId ? parseInt(this.userId) : 0;
  }
}

export const supabaseService = new SupabaseService();
