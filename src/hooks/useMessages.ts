
import { useState, useEffect, useRef } from 'react';
import { signalRService } from '@/services/signalRService'; 
import type { ChatMessage } from '@/services/signalR/types';

export const useMessages = (userId: number, userRole: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadBySender, setUnreadBySender] = useState<Record<number, boolean>>({});
  const maxChars = userRole === 'vip' ? 1000 : 500;
  const messageListenerRef = useRef<any>(null);
  const isInboxViewedRef = useRef<boolean>(false);
  
  // Set up message listener
  useEffect(() => {
    // Load initial unread count
    loadUnreadCount();
    
    // Function to handle new messages
    const handleMessageReceived = (msg: ChatMessage) => {
      // Only count messages TO current user FROM others
      if (msg.recipientId === signalRService.currentUserId && 
          msg.senderId !== signalRService.currentUserId) {
        
        // Check if this is a conversation we're currently viewing
        const isCurrentConversation = msg.senderId === userId;
        
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
    
    // Save reference to listener for cleanup
    messageListenerRef.current = handleMessageReceived;
    
    // Add event listener
    signalRService.onMessageReceived(handleMessageReceived);
    
    // Cleanup
    return () => {
      if (messageListenerRef.current) {
        signalRService.offMessageReceived(messageListenerRef.current);
      }
    };
  }, []);
  
  // When selectedUserId changes, mark messages from that user as read
  useEffect(() => {
    if (userId > 0) {
      // Store the current user ID in SignalR service for reference in other components
      signalRService.currentSelectedUserId = userId;
      
      // Mark messages as read for this specific user
      if (unreadBySender[userId]) {
        resetUnreadForUsers([userId]);
      }
    }
  }, [userId, unreadBySender]);
  
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
    console.log('Inbox viewed, current unread count:', unreadCount);
  };
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    // Create a unique ID for the message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a new message object
    const newMessage: ChatMessage = {
      id: messageId,
      content: message.trim(),
      sender: 'You',
      senderId: signalRService.currentUserId,
      recipientId: userId,
      timestamp: new Date(),
      status: 'sent',
      isRead: true
    };
    
    // Add to messages state
    setMessages(prev => [...prev, newMessage]);
    
    // Send using signalR service
    signalRService.sendMessage(userId, message.trim());
    
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
    setMessage(prev => prev + emoji);
  };
  
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
