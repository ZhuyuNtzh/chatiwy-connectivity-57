
import { useState, useEffect, useRef } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { useUser } from '@/contexts/UserContext';

export const useChatMessages = (userId: number, userRole: string, isTranslationEnabled: boolean, selectedLanguage: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const previousUserIdRef = useRef<number | null>(null);
  const { currentUser } = useUser();
  
  // Load and manage chat messages
  useEffect(() => {
    // Clear messages when switching users
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== userId) {
      console.log(`Switching from user ${previousUserIdRef.current} to ${userId}, clearing messages`);
      setMessages([]);
    }
    
    previousUserIdRef.current = userId;

    const handleNewMessage = (msg: ChatMessage) => {
      // Only show messages that belong to the current conversation
      const isFromSelectedUser = msg.senderId === userId && msg.recipientId === signalRService.currentUserId;
      const isToSelectedUser = msg.senderId === signalRService.currentUserId && msg.recipientId === userId;
      
      if (isFromSelectedUser || isToSelectedUser) {
        console.log(`Message belongs to conversation with user ${userId}:`, msg);
        setMessages(prev => [...prev, msg]);
      } else {
        console.log(`Message not for conversation with user ${userId}:`, msg);
      }
    };
    
    const handleMessageDeleted = (messageId: string) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: true } 
            : msg
        )
      );
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    signalRService.onMessageDeleted(handleMessageDeleted);
    
    console.log(`Loading chat history for user ${userId}`);
    const existingMessages = signalRService.getChatHistory(userId);
    if (existingMessages && existingMessages.length > 0) {
      console.log(`Found ${existingMessages.length} messages for user ${userId}`);
      
      // Filter messages to only include ones relevant to this conversation
      const filteredMessages = existingMessages.filter(msg => 
        (msg.senderId === userId && msg.recipientId === signalRService.currentUserId) ||
        (msg.senderId === signalRService.currentUserId && msg.recipientId === userId)
      );
      
      setMessages(filteredMessages);
    } else {
      console.log(`No existing messages found for user ${userId}`);
      setMessages([]);
    }
    
    return () => {
      signalRService.offMessageReceived(handleNewMessage);
      signalRService.offMessageDeleted(handleMessageDeleted);
    };
  }, [userId, userRole, isTranslationEnabled, selectedLanguage]);

  const toggleImageBlur = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isBlurred: !msg.isBlurred } : msg
    ));
  };

  return {
    messages,
    setMessages,
    toggleImageBlur
  };
};
