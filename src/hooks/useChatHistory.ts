
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
  
  // Clear chat history every 10 hours for VIP users
  useEffect(() => {
    if (userRole !== 'vip') return;
    
    const clearIntervalTime = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
    const intervalId = setInterval(() => {
      console.log('Clearing chat history for VIP user');
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
