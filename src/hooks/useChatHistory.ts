
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';

interface User {
  id: number;
  username: string;
  gender: string;
  age: number;
  location: string;
  interests: string[];
  isOnline: boolean;
}

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<Record<number, ChatMessage[]>>({});
  const [inboxMessages, setInboxMessages] = useState<Record<number, ChatMessage[]>>({});
  const { userRole, currentUser } = useUser();
  
  // Clear chat history based on user role
  useEffect(() => {
    if (!currentUser) return;
    
    // Clear interval times
    const clearIntervalTime = userRole === 'vip' 
      ? 8 * 60 * 60 * 1000  // 8 hours for VIP users
      : 1 * 60 * 60 * 1000; // 1 hour for standard users
    
    console.log(`Setting up chat history clear interval for ${userRole} user: ${clearIntervalTime / (60 * 60 * 1000)} hours`);
    
    const intervalId = setInterval(() => {
      console.log(`Clearing chat history for ${userRole} user`);
      signalRService.clearAllChatHistory();
      setChatHistory({});
      setInboxMessages({});
    }, clearIntervalTime);
    
    return () => clearInterval(intervalId);
  }, [userRole, currentUser]);
  
  // Clear chat history when user changes
  useEffect(() => {
    // Reset state when user changes
    setChatHistory({});
    setInboxMessages({});
  }, [currentUser?.username]); // Using username instead of id since UserProfile doesn't have id
  
  const handleShowHistory = () => {
    // Get fresh chat history when requesting it
    const allHistory = signalRService.getAllChatHistory();
    
    // Sort the history to display most recent conversations first
    const sortedHistory: Record<number, ChatMessage[]> = {};
    
    // Process each conversation and sort by most recent message
    Object.entries(allHistory).forEach(([userIdStr, messages]) => {
      const userId = parseInt(userIdStr);
      if (messages.length > 0) {
        // Find the most recent message timestamp for this conversation
        const mostRecent = [...messages].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        // Add conversation to sorted history
        sortedHistory[userId] = messages;
      }
    });
    
    // Sort conversations by most recent message overall
    const conversationsByRecency = Object.entries(sortedHistory)
      .map(([userIdStr, messages]) => ({
        userId: parseInt(userIdStr),
        lastMessageTime: Math.max(...messages.map(m => new Date(m.timestamp).getTime())),
        messages
      }))
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    
    // Rebuild sorted history
    const finalSortedHistory: Record<number, ChatMessage[]> = {};
    conversationsByRecency.forEach(item => {
      finalSortedHistory[item.userId] = item.messages;
    });
    
    setChatHistory(finalSortedHistory);
    return finalSortedHistory;
  };
  
  const handleShowInbox = () => {
    // Get fresh chat history when opening inbox
    const allHistory = signalRService.getAllChatHistory();
    
    // Filter messages to only show incoming messages for the current user
    const currentUserId = signalRService.currentUserId;
    const filteredHistory: Record<number, ChatMessage[]> = {};
    
    Object.entries(allHistory).forEach(([userIdStr, messages]) => {
      const userId = parseInt(userIdStr);
      // Only include messages where the current user is the recipient
      const incomingMessages = messages.filter(msg => 
        msg.recipientId === currentUserId && msg.senderId === userId
      );
      
      if (incomingMessages.length > 0) {
        // Sort messages by timestamp (newest first) before adding to filtered history
        const sortedMessages = [...incomingMessages].sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        filteredHistory[userId] = sortedMessages;
      }
    });
    
    // Sort conversations by most recent message overall
    const conversationsByRecency = Object.entries(filteredHistory)
      .map(([userIdStr, messages]) => ({
        userId: parseInt(userIdStr),
        lastMessageTime: Math.max(...messages.map(m => new Date(m.timestamp).getTime())),
        messages
      }))
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    
    // Rebuild sorted history
    const finalSortedHistory: Record<number, ChatMessage[]> = {};
    conversationsByRecency.forEach(item => {
      finalSortedHistory[item.userId] = item.messages;
    });
    
    setInboxMessages(finalSortedHistory);
    return finalSortedHistory;
  };

  const handleContinueChat = (userId: number, mockUsers: User[]) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    return foundUser || null;
  };
  
  return {
    chatHistory,
    setChatHistory,
    inboxMessages,
    setInboxMessages,
    handleShowHistory,
    handleShowInbox,
    handleContinueChat
  };
};
