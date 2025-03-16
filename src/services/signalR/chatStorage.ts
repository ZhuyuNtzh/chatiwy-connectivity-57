
import type { ChatMessage } from './types';

// Store a chat message
export const storeChatMessage = (senderId: number, recipientId: number, message: ChatMessage): void => {
  try {
    // Get existing chat history for the current user
    const allHistory = getAllChatHistoryForUser(senderId);
    
    // Check if there's already a conversation with this recipient
    if (!allHistory[recipientId]) {
      allHistory[recipientId] = [];
    }
    
    // Add the message to the conversation
    allHistory[recipientId].push(message);
    
    // Save back to local storage
    localStorage.setItem(`chat_${senderId}`, JSON.stringify(allHistory));
    
  } catch (error) {
    console.error('Error storing chat message:', error);
  }
};

// Get chat history between two users
export const getChatHistory = (userId1: number, userId2: number): ChatMessage[] => {
  try {
    // Get chats where userId1 is sender and userId2 is recipient
    const allHistory = getAllChatHistoryForUser(userId1);
    const messages1 = allHistory[userId2] || [];
    
    // Get chats where userId2 is sender and userId1 is recipient
    const allHistory2 = getAllChatHistoryForUser(userId2);
    const messages2 = allHistory2[userId1] || [];
    
    // Combine and sort by timestamp
    const allMessages = [...messages1, ...messages2].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    return allMessages;
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Get all chat history for a user
export const getAllChatHistoryForUser = (userId: number): Record<number, ChatMessage[]> => {
  try {
    const stored = localStorage.getItem(`chat_${userId}`);
    if (stored) {
      const history = JSON.parse(stored);
      
      // Parse dates in all messages
      Object.keys(history).forEach(recipientId => {
        history[recipientId] = history[recipientId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      });
      
      return history;
    }
  } catch (error) {
    console.error('Error getting all chat history:', error);
  }
  
  return {};
};

// Clear all chat history for a user
export const clearAllChatHistoryForUser = (userId: number): void => {
  try {
    localStorage.removeItem(`chat_${userId}`);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};

// Mark messages as read
export const markMessagesAsRead = (currentUserId: number, senderId: number): void => {
  try {
    // Get all chat history for current user
    const allHistory = getAllChatHistoryForUser(currentUserId);
    
    // Get conversation with the sender
    const conversation = allHistory[senderId] || [];
    
    // Mark all messages as read
    const updatedConversation = conversation.map(msg => {
      if (msg.senderId === senderId && msg.recipientId === currentUserId && !msg.isRead) {
        return {
          ...msg,
          isRead: true
        };
      }
      return msg;
    });
    
    // Update the conversation
    allHistory[senderId] = updatedConversation;
    
    // Save back to local storage
    localStorage.setItem(`chat_${currentUserId}`, JSON.stringify(allHistory));
    
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};
