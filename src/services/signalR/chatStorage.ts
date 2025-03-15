
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
    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }
    chatHistory[userId].push(message);
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
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
