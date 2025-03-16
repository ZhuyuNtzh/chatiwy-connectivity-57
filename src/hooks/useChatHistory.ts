
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
  const { userRole } = useUser();
  
  // Clear chat history based on user role
  useEffect(() => {
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
  }, [userRole]);
  
  const handleShowHistory = () => {
    const allHistory = signalRService.getAllChatHistory();
    setChatHistory(allHistory);
    return allHistory;
  };
  
  const handleShowInbox = () => {
    // Get all chat history when opening inbox
    const allHistory = signalRService.getAllChatHistory();
    setInboxMessages(allHistory);
    return allHistory;
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
