
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
    // Initialize array if this is the first message with this user
    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }
    
    // Check if we already have this message (prevent duplicates)
    const isDuplicate = chatHistory[userId].some(msg => msg.id === message.id);
    
    if (!isDuplicate) {
      // Add message to the specific user's chat history
      chatHistory[userId].push(message);
      
      // Save to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      
      // Debug info
      console.log(`Added message to history for user ${userId}`, message);
    } else {
      console.log(`Prevented duplicate message for user ${userId}`, message);
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
  }
};
