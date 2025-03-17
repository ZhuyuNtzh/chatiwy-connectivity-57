
import type { ChatMessage } from './types';
import { storeChatMessage, getChatHistory, getAllChatHistoryForUser, clearAllChatHistoryForUser, markMessagesAsRead } from './chatStorage';
import { checkAndFilterMessage } from './contentModeration';
import { handleIncomingMessage } from './messageHandler';

// Create a promise-based version of clearAllChatHistoryForUser
export const clearAllChatHistoryAsync = async (userId: number): Promise<void> => {
  return new Promise((resolve) => {
    // Use setTimeout to prevent blocking the main thread
    setTimeout(() => {
      clearAllChatHistoryForUser(userId);
      resolve();
    }, 0);
  });
};

export const createChatManagementService = (currentUserId: () => number, currentUsername: () => string, getBannedWords: () => string[]) => {
  // Get conversation history with a specific user
  const getChatHistoryForUser = (userId: number): ChatMessage[] => {
    return getChatHistory(currentUserId(), userId);
  };
  
  // Get all chat history for the current user
  const getAllChatHistory = (): Record<number, ChatMessage[]> => {
    return getAllChatHistoryForUser(currentUserId());
  };
  
  // Clear all chat history for the current user - now async
  const clearAllChatHistory = async (): Promise<void> => {
    return clearAllChatHistoryAsync(currentUserId());
  };
  
  // Mark messages from a specific user as read
  const markMessagesAsReadForUser = (userId: number): boolean => {
    try {
      markMessagesAsRead(currentUserId(), userId);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  };
  
  // Send a message to another user
  const sendMessage = async (
    recipientId: number, 
    content: string,
    attachments?: any[],
    replyToId?: string,
    replyText?: string
  ): Promise<boolean> => {
    if (!currentUserId()) {
      console.error('Cannot send message: no user ID');
      return false;
    }
    
    // Check if message contains banned words
    const { isAllowed, filteredMessage } = checkAndFilterMessage(content, getBannedWords());
    if (!isAllowed) {
      console.error('Message contains banned words');
      return false;
    }
    
    // Create a unique message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create message object
    const message: ChatMessage = {
      id: messageId,
      content: filteredMessage,
      sender: currentUsername(),
      actualUsername: currentUsername(),
      senderId: currentUserId(),
      recipientId: recipientId,
      timestamp: new Date(),
      status: 'sent',
      isRead: true,
      replyToId,
      replyText
    };
    
    if (attachments && attachments.length > 0) {
      message.attachments = attachments;
    }
    
    // Store message in local storage
    storeChatMessage(currentUserId(), recipientId, message);
    
    console.log(`Added message to history for user ${currentUserId()}, conversation ${recipientId}`, message);
    
    // Store reply text in localStorage for later reference
    if (replyToId && replyText) {
      localStorage.setItem(`replyText_${replyToId}`, replyText);
    }
    
    return true;
  };
  
  // Send an image message
  const sendImage = (recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<boolean> => {
    if (!currentUserId()) {
      console.error('Cannot send image: no user ID');
      return Promise.resolve(false);
    }
    
    // Create a unique message ID
    const messageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create message object
    const message: ChatMessage = {
      id: messageId,
      content: 'Image message',
      sender: currentUsername(),
      actualUsername: currentUsername(),
      senderId: currentUserId(),
      recipientId: recipientId,
      timestamp: new Date(),
      isImage: true,
      imageUrl,
      isBlurred,
      status: 'sent',
      isRead: true
    };
    
    // Store message in local storage
    storeChatMessage(currentUserId(), recipientId, message);
    
    // Trigger received message event for immediate UI update
    handleIncomingMessage(message);
    
    return Promise.resolve(true);
  };
  
  // Send a voice message
  const sendVoiceMessage = (recipientId: number, audioUrl: string): Promise<boolean> => {
    if (!currentUserId()) {
      console.error('Cannot send voice message: no user ID');
      return Promise.resolve(false);
    }
    
    // Create a unique message ID
    const messageId = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create message object
    const message: ChatMessage = {
      id: messageId,
      content: 'Voice message',
      sender: currentUsername(),
      actualUsername: currentUsername(),
      senderId: currentUserId(),
      recipientId: recipientId,
      timestamp: new Date(),
      isVoiceMessage: true,
      audioUrl,
      status: 'sent',
      isRead: true
    };
    
    // Store message in local storage
    storeChatMessage(currentUserId(), recipientId, message);
    
    // Trigger received message event for immediate UI update
    handleIncomingMessage(message);
    
    return Promise.resolve(true);
  };
  
  // Delete a message
  const deleteMessage = (messageId: string, recipientId: number): Promise<boolean> => {
    // Get chat history
    const history = getChatHistory(currentUserId(), recipientId);
    
    // Find the message
    const messageIndex = history.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return Promise.resolve(false);
    }
    
    // Mark the message as deleted
    history[messageIndex].isDeleted = true;
    history[messageIndex].content = 'This message has been deleted';
    
    // Update the history
    const allHistory = getAllChatHistoryForUser(currentUserId());
    allHistory[recipientId] = history;
    
    // Save to local storage
    localStorage.setItem(`chat_${currentUserId()}`, JSON.stringify(allHistory));
    
    // Dispatch the message deleted event
    const event = new CustomEvent('message-deleted', { detail: messageId });
    window.dispatchEvent(event);
    
    return Promise.resolve(true);
  };

  return {
    getChatHistoryForUser,
    getAllChatHistory,
    clearAllChatHistory,
    markMessagesAsReadForUser,
    sendMessage,
    sendImage,
    sendVoiceMessage,
    deleteMessage
  };
};
