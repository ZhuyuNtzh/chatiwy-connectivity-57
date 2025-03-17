
import { useState, useEffect, useRef } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadBySender, setUnreadBySender] = useState<Record<number, boolean>>({});
  const isInboxViewedRef = useRef<boolean>(false);
  
  // Load the initial unread messages count
  const loadUnreadCount = () => {
    // Get all conversations
    const allHistory = signalRService.getAllChatHistory();
    const currentUserId = signalRService.currentUserId;
    let count = 0;
    const newUnreadBySender: Record<number, boolean> = {};
    
    // Go through all conversations
    Object.entries(allHistory).forEach(([senderId, messages]) => {
      const senderIdNum = parseInt(senderId);
      
      // Only count messages TO the current user
      const unreadMessages = messages.filter(msg => 
        msg.recipientId === currentUserId && 
        msg.senderId === senderIdNum && 
        !msg.isRead
      );
      
      if (unreadMessages.length > 0) {
        count += unreadMessages.length;
        newUnreadBySender[senderIdNum] = true;
      }
    });
    
    setUnreadCount(count);
    setUnreadBySender(newUnreadBySender);
  };
  
  // Reset unread count for specific users
  const resetUnreadForUsers = (userIds: number[]) => {
    // Mark messages as read in signalR service
    userIds.forEach(id => {
      signalRService.markMessagesAsRead(id);
    });
    
    // Update the unread by sender state
    setUnreadBySender(prev => {
      const newState = { ...prev };
      userIds.forEach(id => {
        delete newState[id];
      });
      return newState;
    });
    
    // Recalculate total unread count
    const remainingUnreadSenders = Object.keys(unreadBySender)
      .filter(id => !userIds.includes(parseInt(id)))
      .map(id => parseInt(id));
    
    // Get all conversations
    const allHistory = signalRService.getAllChatHistory();
    const currentUserId = signalRService.currentUserId;
    let count = 0;
    
    // Count remaining unread messages
    remainingUnreadSenders.forEach(senderId => {
      const messages = allHistory[senderId] || [];
      const unreadMessages = messages.filter(msg => 
        msg.recipientId === currentUserId && 
        msg.senderId === senderId && 
        !msg.isRead
      );
      count += unreadMessages.length;
    });
    
    setUnreadCount(count);
  };
  
  // Mark inbox as viewed (doesn't reset unread count)
  const markInboxAsViewed = () => {
    // Just mark that inbox was viewed, don't reset counts
    isInboxViewedRef.current = true;
  };

  // Effect to set up message listener for unread counts
  useEffect(() => {
    // Function to handle new messages
    const handleMessageReceived = (msg: ChatMessage) => {
      // Only count messages TO current user FROM others
      if (msg.recipientId === signalRService.currentUserId && 
          msg.senderId !== signalRService.currentUserId) {
        
        // Check if this is a conversation we're currently viewing
        const isCurrentConversation = msg.senderId === signalRService.currentSelectedUserId;
        
        if (!isCurrentConversation) {
          // Increment the unread count
          setUnreadCount(prev => prev + 1);
          
          // Mark this sender as having unread messages
          setUnreadBySender(prev => ({
            ...prev,
            [msg.senderId]: true
          }));
        }
      }
    };

    // Add event listener
    signalRService.onMessageReceived(handleMessageReceived);
    
    // Load initial unread count
    loadUnreadCount();
    
    // Cleanup
    return () => {
      signalRService.offMessageReceived(handleMessageReceived);
    };
  }, []);

  return {
    unreadCount,
    unreadBySender,
    loadUnreadCount,
    resetUnreadForUsers,
    markInboxAsViewed
  };
};
