
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
  }, [currentUser?.id]);
  
  const handleShowHistory = () => {
    // Get fresh chat history when requesting it
    const allHistory = signalRService.getAllChatHistory();
    setChatHistory(allHistory);
    return allHistory;
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
        filteredHistory[userId] = incomingMessages;
      }
    });
    
    setInboxMessages(filteredHistory);
    return filteredHistory;
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
