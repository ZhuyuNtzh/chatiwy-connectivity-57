
import { useState, useEffect } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { toast } from "sonner";
import { useUser } from '@/contexts/UserContext';
import { useVipMessageFeatures } from './useVipMessageFeatures';

export const useMessages = (userId: number, userRole: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { currentUser } = useUser();
  const maxChars = userRole === 'vip' ? 200 : 140;
  
  // Get VIP message features
  const { replyingTo, setReplyingTo, sendReplyMessage, clearReply } = useVipMessageFeatures(userRole);
  
  // Track unread messages by sender ID
  const [unreadBySender, setUnreadBySender] = useState<Record<number, boolean>>({});
  
  // Track whether the inbox has been viewed (for UI purposes only)
  const [inboxViewed, setInboxViewed] = useState(false);

  // Initialize by loading existing unread messages
  useEffect(() => {
    // Load initial unread state
    const loadInitialUnread = () => {
      const allHistory = signalRService.getAllChatHistory();
      const currentUserIdFromSignalR = signalRService.currentUserId;
      
      const initialUnreadBySender: Record<number, boolean> = {};
      let totalUnread = 0;
      
      Object.entries(allHistory).forEach(([userIdStr, messages]) => {
        const senderId = parseInt(userIdStr);
        // Check if we have unread messages from this sender
        const hasUnread = messages.some(msg => 
          msg.senderId === senderId && 
          msg.recipientId === currentUserIdFromSignalR && 
          !msg.isRead
        );
        
        if (hasUnread) {
          initialUnreadBySender[senderId] = true;
          totalUnread++;
        }
      });
      
      setUnreadBySender(initialUnreadBySender);
      setUnreadCount(totalUnread);
    };
    
    loadInitialUnread();
  }, []);

  // Listen for new messages and update unread count
  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      const currentUserIdFromSignalR = signalRService.currentUserId;
      
      // Only count messages that are from other users (not from current user)
      // AND only if they're not from the currently selected conversation
      if (newMessage.senderId !== currentUserIdFromSignalR && 
          newMessage.recipientId === currentUserIdFromSignalR &&
          newMessage.senderId !== userId) {
        
        // Update the unread messages by sender mapping
        setUnreadBySender(prev => {
          const updatedState = {
            ...prev,
            [newMessage.senderId]: true
          };
          
          // Count the number of true values in updatedState
          const newUnreadCount = Object.values(updatedState).filter(Boolean).length;
          
          // Update the count
          setUnreadCount(newUnreadCount);
          
          return updatedState;
        });
        
        // Reset the inbox viewed state when we get a new message
        setInboxViewed(false);
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
        msg.recipientId === signalRService.currentUserId && 
        !msg.isRead
      );
      
      // If we are now viewing messages from a user who sent us messages, 
      // mark their messages as read and update unread counts
      if (hasUnreadFromThisUser && unreadBySender[userId]) {
        // Mark messages as read in chat history
        signalRService.markMessagesAsRead(userId);
        
        // Update the unread by sender map to mark this sender as read
        setUnreadBySender(prev => {
          const updated = {
            ...prev,
            [userId]: false
          };
          
          // Recalculate unread count based on updated state
          const newCount = Object.values(updated).filter(Boolean).length;
          setUnreadCount(newCount);
          
          return updated;
        });
      }
    }
  }, [userId, unreadBySender]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(userId)) {
      toast.error(`You have blocked this user and cannot send messages.`);
      return;
    }
    
    // Check if we're replying to a message
    if (replyingTo && userRole === 'vip') {
      const success = sendReplyMessage(message.trim(), userId, setMessages);
      if (success) {
        setMessage('');
        return;
      }
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
      isRead: true, // Mark as read since it's our own message
      status: 'sent'
    };
    
    // Add message to local state first for immediate UI update
    setMessages(prev => [...prev, newMessage]);
    
    // Then send to service - pass the actual username so it can be stored with the message
    signalRService.sendMessage(userId, message.trim());
    
    // Clear input field and any reply state
    setMessage('');
    if (replyingTo) {
      clearReply(setMessages);
    }
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

  // Mark the inbox as viewed but don't reset unread counts - only UI change
  const markInboxAsViewed = () => {
    setInboxViewed(true);
  };

  // Reset only the unread counts for specific users - this happens when actively opening a chat
  const resetUnreadForUsers = (userIds: number[]) => {
    // Mark these users' messages as read in the chat history
    userIds.forEach(id => {
      signalRService.markMessagesAsRead(id);
    });
    
    setUnreadBySender(prev => {
      const newState = { ...prev };
      userIds.forEach(id => {
        newState[id] = false;
      });
      
      // Calculate total unread count based on the updated unreadBySender
      const remainingUnread = Object.values(newState).filter(Boolean).length;
      setUnreadCount(remainingUnread);
      
      return newState;
    });
  };

  // Reset all unread counts - for use when explicitly viewing all messages in inbox dialog
  const resetUnreadCount = () => {
    // Mark all messages as read
    Object.keys(unreadBySender).forEach(id => {
      signalRService.markMessagesAsRead(parseInt(id));
    });
    
    setUnreadCount(0);
    setUnreadBySender({});
    setInboxViewed(true);
  };

  return {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars,
    unreadCount,
    unreadBySender,
    inboxViewed,
    replyingTo,
    setReplyingTo,
    resetUnreadCount,
    markInboxAsViewed,
    resetUnreadForUsers,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji,
    clearReply
  };
};
