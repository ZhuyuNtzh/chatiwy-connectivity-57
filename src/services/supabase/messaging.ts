
import { supabase } from "@/lib/supabase";
import { subscribeToConversation } from "@/lib/supabase/realtime";
import { ChatMessage } from "../signalR/types";
import { MessageCallback } from "./types";

/**
 * Messaging functionality for the Supabase service
 */
export const supabaseMessaging = {
  /**
   * Ensure a conversation exists between two users
   */
  async ensureConversationExists(userId: string, otherUserId: string): Promise<string> {
    if (!userId) throw new Error('User not initialized');
    
    try {
      console.log(`Ensuring conversation exists between users ${userId} and ${otherUserId}`);
      
      const { data: existingConversations, error: findError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);
      
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
          .insert({ user_id: userId, conversation_id: newConversation.id });
          
        const { error: insertError2 } = await supabase
          .from('conversation_participants')
          .insert({ user_id: otherUserId, conversation_id: newConversation.id });
        
        if (insertError1 || insertError2) {
          console.error('Error adding participant(s):', insertError1 || insertError2);
        }
        
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
        .insert({ user_id: userId, conversation_id: newConversation.id });
        
      const { error: insertError2 } = await supabase
        .from('conversation_participants')
        .insert({ user_id: otherUserId, conversation_id: newConversation.id });
      
      if (insertError1 || insertError2) {
        console.error('Error adding participant(s):', insertError1 || insertError2);
      }
      
      return newConversation.id;
    } catch (err) {
      console.error('Error ensuring conversation exists:', err);
      const fallbackId = `fallback-${Date.now()}`;
      console.log(`Using fallback conversation ID: ${fallbackId}`);
      return fallbackId;
    }
  },
  
  /**
   * Subscribe to messages in a conversation
   */
  subscribeToMessages(conversationId: string, messageCallback: MessageCallback) {
    return subscribeToConversation(
      conversationId,
      (message) => {
        const chatMessage: ChatMessage = {
          id: message.id,
          content: message.content,
          sender: message.sender_id,
          recipientId: 0, // Will be set by caller
          senderId: parseInt(message.sender_id),
          timestamp: new Date(message.created_at),
          isRead: message.is_read,
          status: 'delivered',
          isImage: message.is_image,
          imageUrl: message.image_url || undefined,
          audioUrl: message.audio_url || undefined
        };
        
        messageCallback(chatMessage);
      }
    );
  },
  
  /**
   * Send a message
   */
  async sendMessage(
    senderId: string, 
    senderName: string, 
    receiverId: number, 
    content: string, 
    messageType: string = 'text', 
    mediaUrl?: string
  ): Promise<boolean> {
    if (!senderId || !senderName) return false;
    
    try {
      console.log(`Sending ${messageType} message to user ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const conversationId = await this.ensureConversationExists(senderId, receiverId.toString());
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          content: content,
          conversation_id: conversationId,
          is_read: false,
          sender_name: senderName,
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
  },
  
  /**
   * Mark a message as read
   */
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
  },
  
  /**
   * Delete a message (soft delete)
   */
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
  },
  
  /**
   * Get chat history with a specific user
   */
  async getChatHistory(userId: string, otherUserId: number): Promise<ChatMessage[]> {
    if (!userId) return [];
    
    try {
      console.log(`Fetching chat history with user ${otherUserId}`);
      
      try {
        const conversationId = await this.ensureConversationExists(userId, otherUserId.toString());
        
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
          recipientId: parseInt(userId),
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
        
        console.log(`Retrieved ${messages.length} messages with user ${otherUserId}`);
        return messages;
      } catch (err) {
        console.error('Error finding/creating conversation:', err);
        return [];
      }
    } catch (err) {
      console.error('Exception fetching chat history:', err);
      return [];
    }
  },
  
  /**
   * Get all chat history
   */
  async getAllChatHistory(userId: string): Promise<ChatMessage[]> {
    if (!userId) return [];
    
    try {
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversation:conversation_id(*)
        `)
        .eq('user_id', userId);
        
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
        recipientId: parseInt(userId),
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
};
