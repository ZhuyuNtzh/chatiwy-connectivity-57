
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
    
    // Also save to localStorage to persist across page reloads
    localStorage.setItem('unreadCount', count.toString());
    localStorage.setItem('unreadBySender', JSON.stringify(newUnreadBySender));
    
    return { count, newUnreadBySender };
  };
  
  // Reset unread count for specific users
  const resetUnreadForUsers = (userIds: number[]) => {
    if (!userIds.length) return;
    
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
      
      // Save updated state to localStorage
      localStorage.setItem('unreadBySender', JSON.stringify(newState));
      return newState;
    });
    
    // Recalculate total unread count
    const allHistory = signalRService.getAllChatHistory();
    const currentUserId = signalRService.currentUserId;
    let count = 0;
    
    // Count all unread messages
    Object.entries(allHistory).forEach(([senderId, messages]) => {
      const senderIdNum = parseInt(senderId);
      // Skip users we just marked as read
      if (userIds.includes(senderIdNum)) return;
      
      const unreadMessages = messages.filter(msg => 
        msg.recipientId === currentUserId && 
        msg.senderId === senderIdNum && 
        !msg.isRead
      );
      
      count += unreadMessages.length;
    });
    
    setUnreadCount(count);
    localStorage.setItem('unreadCount', count.toString());
  };
  
  // Mark inbox as viewed (doesn't reset unread count)
  const markInboxAsViewed = () => {
    isInboxViewedRef.current = true;
  };

  // Effect to load data from localStorage on initial render
  useEffect(() => {
    const storedCount = localStorage.getItem('unreadCount');
    const storedBySender = localStorage.getItem('unreadBySender');
    
    if (storedCount) {
      setUnreadCount(parseInt(storedCount));
    }
    
    if (storedBySender) {
      try {
        setUnreadBySender(JSON.parse(storedBySender));
      } catch (e) {
        console.error('Failed to parse unreadBySender from localStorage', e);
      }
    }
    
    // Then load fresh data
    loadUnreadCount();
  }, []);

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
          setUnreadCount(prev => {
            const newCount = prev + 1;
            localStorage.setItem('unreadCount', newCount.toString());
            return newCount;
          });
          
          // Mark this sender as having unread messages
          setUnreadBySender(prev => {
            const newState = {
              ...prev,
              [msg.senderId]: true
            };
            localStorage.setItem('unreadBySender', JSON.stringify(newState));
            return newState;
          });
        }
      }
    };

    // Add event listener
    signalRService.onMessageReceived(handleMessageReceived);
    
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
