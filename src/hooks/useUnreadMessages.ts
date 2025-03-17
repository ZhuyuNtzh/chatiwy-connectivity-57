
import { useState, useEffect, useCallback } from 'react';
import { signalRService } from '@/services/signalRService';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadBySender, setUnreadBySender] = useState<Record<number, number>>({});

  // Load unread messages from localStorage on component mount
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Function to load unread messages from localStorage
  const loadUnreadCount = useCallback(() => {
    try {
      // Get all chat histories for current user
      const userId = signalRService.currentUserId;
      if (!userId) return { count: 0, newUnreadBySender: {} };

      const allHistory = signalRService.getAllChatHistory();
      let totalUnread = 0;
      const newUnreadBySender: Record<number, number> = {};
      
      // Retrieve and parse unread messages data from localStorage
      const unreadData = localStorage.getItem(`unread_${userId}`);
      if (unreadData) {
        try {
          const parsed = JSON.parse(unreadData);
          setUnreadBySender(parsed);
          
          // Calculate total unread count from all senders
          Object.values(parsed).forEach((count: number) => {
            totalUnread += count;
          });
          
          setUnreadCount(totalUnread);
          return { count: totalUnread, newUnreadBySender: parsed };
        } catch (e) {
          console.error('Error parsing unread data:', e);
        }
      }
      
      // If no stored data exists, calculate from message history
      Object.keys(allHistory).forEach(senderId => {
        const messages = allHistory[Number(senderId)] || [];
        const unreadMessages = messages.filter(msg => 
          msg.senderId !== userId && 
          msg.recipientId === userId && 
          !msg.isRead
        );
        
        if (unreadMessages.length > 0) {
          newUnreadBySender[Number(senderId)] = unreadMessages.length;
          totalUnread += unreadMessages.length;
        }
      });
      
      // Update state
      setUnreadCount(totalUnread);
      setUnreadBySender(newUnreadBySender);
      
      // Store the calculated values in localStorage
      localStorage.setItem(`unread_${userId}`, JSON.stringify(newUnreadBySender));
      
      return { count: totalUnread, newUnreadBySender };
    } catch (error) {
      console.error('Error loading unread counts:', error);
      return { count: 0, newUnreadBySender: {} };
    }
  }, []);

  // Mark messages from specific users as read
  const resetUnreadForUsers = useCallback((userIds: number[]) => {
    try {
      const userId = signalRService.currentUserId;
      if (!userId) return;
      
      // Get current unread data
      const currentUnreadData = { ...unreadBySender };
      let updatedCount = unreadCount;
      
      // Mark messages as read for each user
      userIds.forEach(senderId => {
        if (currentUnreadData[senderId]) {
          updatedCount -= currentUnreadData[senderId];
          delete currentUnreadData[senderId];
          
          // Also update in the SignalR service
          signalRService.markMessagesAsRead(senderId);
        }
      });
      
      // Update state
      setUnreadCount(updatedCount);
      setUnreadBySender(currentUnreadData);
      
      // Save to localStorage
      localStorage.setItem(`unread_${userId}`, JSON.stringify(currentUnreadData));
    } catch (error) {
      console.error('Error resetting unread counts:', error);
    }
  }, [unreadCount, unreadBySender]);

  // Mark all messages as read (for inbox view)
  const markInboxAsViewed = useCallback(() => {
    try {
      const userId = signalRService.currentUserId;
      if (!userId) return;
      
      // Clear all unread counts
      setUnreadCount(0);
      setUnreadBySender({});
      
      // Remove from localStorage
      localStorage.removeItem(`unread_${userId}`);
    } catch (error) {
      console.error('Error marking inbox as viewed:', error);
    }
  }, []);

  return {
    unreadCount,
    unreadBySender,
    loadUnreadCount,
    resetUnreadForUsers,
    markInboxAsViewed
  };
};
