
import { useEffect } from 'react';
import { signalRService } from '@/services/signalRService'; 
import type { ChatMessage } from '@/services/signalR/types';
import { useMessageState } from './useMessageState';
import { useMessageSending } from './useMessageSending';
import { useUnreadMessages } from './useUnreadMessages';

export const useMessages = (userId: number, userRole: string) => {
  const { 
    messages, 
    setMessages, 
    message, 
    setMessage, 
    maxChars 
  } = useMessageState(userRole);
  
  const {
    handleSendMessage: baseSendMessage,
    handleKeyDown: baseKeyDown,
    handleAddEmoji
  } = useMessageSending(userId, setMessage);
  
  const {
    unreadCount,
    unreadBySender,
    loadUnreadCount,
    resetUnreadForUsers,
    markInboxAsViewed
  } = useUnreadMessages();
  
  // Wrapper functions to pass the current message
  const handleSendMessage = (e?: React.FormEvent) => {
    baseSendMessage(e, message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    baseKeyDown(e, message);
  };
  
  // When selectedUserId changes, mark messages from that user as read
  useEffect(() => {
    if (userId > 0) {
      // Store the current user ID in SignalR service for reference in other components
      signalRService.currentSelectedUserId = userId;
      
      // Mark messages as read for this specific user
      if (unreadBySender[userId]) {
        resetUnreadForUsers([userId]);
        
        // Re-calculate unread counts after marking as read
        setTimeout(() => {
          loadUnreadCount();
        }, 100);
      }
    }
  }, [userId, unreadBySender, resetUnreadForUsers]);

  return {
    messages,
    setMessages,
    message,
    setMessage,
    unreadCount,
    unreadBySender,
    maxChars,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji,
    resetUnreadForUsers,
    markInboxAsViewed,
    loadUnreadCount
  };
};
