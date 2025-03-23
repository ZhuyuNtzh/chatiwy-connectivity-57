
import { ChatMessage } from './types';

// We need to namespace chat history by user ID to prevent data leakage between sessions
let chatHistoryByUser: Record<number, Record<number, ChatMessage[]>> = {};

export const chatStorage = {
  loadFromStorage() {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        // Load existing format for backward compatibility
        const loadedHistory = JSON.parse(savedChatHistory);
        
        // Check if it's already in the new format
        if (Object.values(loadedHistory).every(value => typeof value === 'object' && !(value instanceof Array))) {
          chatHistoryByUser = loadedHistory;
        } else {
          // If it's in the old format, convert it
          const currentUserId = parseInt(localStorage.getItem('currentUserId') || '0');
          if (currentUserId) {
            chatHistoryByUser[currentUserId] = loadedHistory;
          }
        }
      } catch (e) {
        console.error('Error parsing chat history:', e);
        chatHistoryByUser = {};
      }
    }
  },

  addMessageToHistory(currentUserId: number, userId: number, message: ChatMessage) {
    // Initialize user history if needed
    if (!chatHistoryByUser[currentUserId]) {
      chatHistoryByUser[currentUserId] = {};
    }
    
    // For a given message, get the correct conversation ID
    // The conversation ID should always be the other user's ID, NOT the current user's ID
    // For the current user sending a message: use recipientId (who they're sending to)
    // For incoming messages to current user: use senderId (who sent it)
    const conversationId = message.senderId === userId ? message.recipientId : message.senderId;
    
    // Initialize array if this is the first message with this user
    if (!chatHistoryByUser[currentUserId][conversationId]) {
      chatHistoryByUser[currentUserId][conversationId] = [];
    }
    
    // Check if we already have this message (prevent duplicates)
    const isDuplicate = chatHistoryByUser[currentUserId][conversationId].some(msg => msg.id === message.id);
    
    if (!isDuplicate) {
      // Add message to the specific conversation history
      chatHistoryByUser[currentUserId][conversationId].push(message);
      
      // Save to localStorage asynchronously to prevent UI freezing
      setTimeout(() => {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(chatHistoryByUser));
          localStorage.setItem('currentUserId', currentUserId.toString());
          
          // Debug info
          console.log(`Added message to history for user ${currentUserId}, conversation ${conversationId}`, message);
        } catch (error) {
          console.error('Error saving chat history to localStorage:', error);
        }
      }, 0);
    } else {
      console.log(`Prevented duplicate message for user ${currentUserId}, conversation ${conversationId}`, message);
    }
  },

  markMessageAsDeleted(currentUserId: number, userId: number, messageId: string) {
    if (chatHistoryByUser[currentUserId] && chatHistoryByUser[currentUserId][userId]) {
      chatHistoryByUser[currentUserId][userId] = chatHistoryByUser[currentUserId][userId].map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      );
      
      // Save to localStorage asynchronously
      setTimeout(() => {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(chatHistoryByUser));
        } catch (error) {
          console.error('Error saving deleted message state to localStorage:', error);
        }
      }, 0);
    }
  },

  markMessagesAsRead(currentUserId: number, senderId: number, recipientId: number) {
    // Mark messages from this sender to this recipient as read
    if (chatHistoryByUser[currentUserId] && chatHistoryByUser[currentUserId][senderId]) {
      chatHistoryByUser[currentUserId][senderId] = chatHistoryByUser[currentUserId][senderId].map(msg => 
        // Only mark messages where senderId is the sender and recipientId is the recipient
        (msg.senderId === senderId && msg.recipientId === recipientId)
          ? { ...msg, isRead: true } 
          : msg
      );
      
      // Save to localStorage asynchronously
      setTimeout(() => {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(chatHistoryByUser));
        } catch (error) {
          console.error('Error saving read status to localStorage:', error);
        }
      }, 0);
    }
  },

  getChatHistory(currentUserId: number, userId: number): ChatMessage[] {
    // Return only messages for this specific user conversation
    return (chatHistoryByUser[currentUserId] && chatHistoryByUser[currentUserId][userId]) 
      ? chatHistoryByUser[currentUserId][userId] 
      : [];
  },

  getAllChatHistory(currentUserId: number): Record<number, ChatMessage[]> {
    // Return all conversations for the current user
    return chatHistoryByUser[currentUserId] || {};
  },

  clearAllChatHistory(currentUserId: number) {
    // Only clear history for the current user
    if (chatHistoryByUser[currentUserId]) {
      delete chatHistoryByUser[currentUserId];
      
      // Save to localStorage asynchronously
      setTimeout(() => {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(chatHistoryByUser));
        } catch (error) {
          console.error('Error clearing all chat history in localStorage:', error);
        }
      }, 0);
    }
  },
  
  // Method to clear a specific conversation history
  clearChatHistory(currentUserId: number, userId: number) {
    if (chatHistoryByUser[currentUserId] && chatHistoryByUser[currentUserId][userId]) {
      delete chatHistoryByUser[currentUserId][userId];
      
      // Save to localStorage asynchronously
      setTimeout(() => {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(chatHistoryByUser));
        } catch (error) {
          console.error('Error clearing specific chat history in localStorage:', error);
        }
      }, 0);
    }
  },

  // Method to clear history on logout
  clearUserSession(currentUserId: number) {
    if (chatHistoryByUser[currentUserId]) {
      delete chatHistoryByUser[currentUserId];
      
      // Save to localStorage asynchronously
      setTimeout(() => {
        try {
          localStorage.setItem('chatHistory', JSON.stringify(chatHistoryByUser));
        } catch (error) {
          console.error('Error clearing user session in localStorage:', error);
        }
      }, 0);
    }
  }
};
