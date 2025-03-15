
import { useState, useEffect } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { toast } from "sonner";
import { useUser } from '@/contexts/UserContext';

export const useMessages = (userId: number, userRole: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { currentUser } = useUser();
  const maxChars = userRole === 'vip' ? 200 : 140;

  // Listen for new messages and update unread count
  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      // Only count messages that are from other users (not from current user)
      // AND only if they're not from the currently selected conversation
      if (newMessage.senderId !== signalRService.currentUserId && 
          newMessage.recipientId === signalRService.currentUserId &&
          newMessage.senderId !== userId) {
        setUnreadCount(prev => prev + 1);
      }
    };

    signalRService.onMessageReceived(handleNewMessage);
    
    return () => {
      signalRService.offMessageReceived(handleNewMessage);
    };
  }, [userId]);

  // Reset unread count when changing the selected user (if they had unread messages)
  useEffect(() => {
    if (userId) {
      // Get chat history for this user
      const userHistory = signalRService.getChatHistory(userId);
      
      // Check if there are any unread messages from this user
      const hasUnreadFromThisUser = userHistory.some(msg => 
        msg.senderId === userId && 
        msg.recipientId === signalRService.currentUserId);
      
      // If we are now viewing messages from a user who sent us messages, reduce count
      if (hasUnreadFromThisUser) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [userId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(userId)) {
      toast.error(`You have blocked this user and cannot send messages.`);
      return;
    }
    
    // Create a message with the correct username from currentUser
    const username = currentUser?.username || 'You';
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: message.trim(),
      sender: username,
      actualUsername: username, // This is the correct username to display
      senderId: signalRService.currentUserId,
      recipientId: userId,
      timestamp: new Date(),
    };
    
    // Add message to local state first for immediate UI update
    setMessages(prev => [...prev, newMessage]);
    
    // Then send to service - pass the actual username so it can be stored with the message
    signalRService.sendMessage(userId, message.trim(), username);
    
    // Clear input field
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddEmoji = (emoji: string) => {
    if (message.length + emoji.length <= maxChars) {
      setMessage(prev => prev + emoji);
    }
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars,
    unreadCount,
    resetUnreadCount,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji,
  };
};
