
import { ChatMessage } from './types';

let chatHistory: Record<number, ChatMessage[]> = {};

export const chatStorage = {
  loadFromStorage() {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        chatHistory = JSON.parse(savedChatHistory);
      } catch (e) {
        console.error('Error parsing chat history:', e);
        chatHistory = {};
      }
    }
  },

  addMessageToHistory(userId: number, message: ChatMessage) {
    // For a given message, get the correct conversation ID
    // The conversation ID should always be the other user's ID, NOT the current user's ID
    // For the current user sending a message: use recipientId (who they're sending to)
    // For incoming messages to current user: use senderId (who sent it)
    const conversationId = message.senderId === userId ? message.recipientId : message.senderId;
    
    // Initialize array if this is the first message with this user
    if (!chatHistory[conversationId]) {
      chatHistory[conversationId] = [];
    }
    
    // Check if we already have this message (prevent duplicates)
    const isDuplicate = chatHistory[conversationId].some(msg => msg.id === message.id);
    
    if (!isDuplicate) {
      // Add message to the specific conversation history
      chatHistory[conversationId].push(message);
      
      // Save to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      
      // Debug info
      console.log(`Added message to history for conversation ${conversationId}`, message);
    } else {
      console.log(`Prevented duplicate message for conversation ${conversationId}`, message);
    }
  },

  markMessageAsDeleted(userId: number, messageId: string) {
    if (chatHistory[userId]) {
      chatHistory[userId] = chatHistory[userId].map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      );
      
      // Save to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  },

  markMessagesAsRead(senderId: number, recipientId: number) {
    // Mark messages from this sender to this recipient as read
    if (chatHistory[senderId]) {
      chatHistory[senderId] = chatHistory[senderId].map(msg => 
        // Only mark messages where senderId is the sender and recipientId is the recipient
        (msg.senderId === senderId && msg.recipientId === recipientId)
          ? { ...msg, isRead: true } 
          : msg
      );
      
      // Save to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  },

  getChatHistory(userId: number): ChatMessage[] {
    // Return only messages for this specific user conversation
    return chatHistory[userId] || [];
  },

  getAllChatHistory(): Record<number, ChatMessage[]> {
    return { ...chatHistory };
  },

  clearAllChatHistory() {
    chatHistory = {};
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  },
  
  // Method to clear a specific conversation history
  clearChatHistory(userId: number) {
    if (chatHistory[userId]) {
      delete chatHistory[userId];
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }
};
