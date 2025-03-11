
import { useState } from 'react';
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
