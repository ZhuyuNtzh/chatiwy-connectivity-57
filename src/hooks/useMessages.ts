
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
  
  // Track unread messages by sender ID
  const [unreadBySender, setUnreadBySender] = useState<Record<number, boolean>>({});
  
  // Track whether the inbox has been viewed (for UI purposes only)
  const [inboxViewed, setInboxViewed] = useState(false);

  // Listen for new messages and update unread count
  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      // Only count messages that are from other users (not from current user)
      // AND only if they're not from the currently selected conversation
      if (newMessage.senderId !== signalRService.currentUserId && 
          newMessage.recipientId === signalRService.currentUserId &&
          newMessage.senderId !== userId) {
        
        // Update the unread messages by sender mapping
        setUnreadBySender(prev => ({
          ...prev,
          [newMessage.senderId]: true
        }));
        
        // Recalculate the unread count based on unique senders with unread messages
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
  }, [userId, unreadBySender]);

  // Reset unread count when changing the selected user (if they had unread messages)
  useEffect(() => {
    if (userId) {
      // Get chat history for this user
      const userHistory = signalRService.getChatHistory(userId);
      
      // Check if there are any unread messages from this user
      const hasUnreadFromThisUser = userHistory.some(msg => 
        msg.senderId === userId && 
        msg.recipientId === signalRService.currentUserId);
      
      // If we are now viewing messages from a user who sent us messages, 
      // only clear the unread status for this specific user
      if (hasUnreadFromThisUser && unreadBySender[userId]) {
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

  // Mark the inbox as viewed but don't reset unread counts
  const markInboxAsViewed = () => {
    setInboxViewed(true);
  };

  // Reset only the unread counts for specific users
  const resetUnreadForUsers = (userIds: number[]) => {
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

  // Reset all unread counts - for use when opening the inbox dialog
  const resetUnreadCount = () => {
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
    resetUnreadCount,
    markInboxAsViewed,
    resetUnreadForUsers,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji,
  };
};
