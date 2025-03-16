
import { useState } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { toast } from "sonner";

export const useVipMessageFeatures = (userRole: string) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  /**
   * Handle replying to a message
   */
  const replyToMessage = (
    messageId: string,
    messageText: string,
    currentMessage: string,
    setCurrentMessage: (message: string) => void,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    userId: number,
    setAutoScrollToBottom: (value: boolean) => void
  ) => {
    // Only VIP users can reply to messages
    if (userRole !== 'vip') {
      toast.error('Only VIP users can reply to messages');
      return;
    }
    
    setReplyingTo(messageId);
    
    // Store the reply text for this specific message ID
    localStorage.setItem(`replyText_${messageId}`, messageText);
    
    // Focus on the input field
    const inputField = document.querySelector('input[name="message"]') as HTMLInputElement;
    if (inputField) {
      inputField.focus();
    }
    
    // Update all messages to mark the one being replied to
    setMessages((prev) => {
      return prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isBeingRepliedTo: true, replyText: messageText }
          : { ...msg, isBeingRepliedTo: false }
      );
    });
    
    // Update the reply message in the UI
    const prefix = currentMessage.trim() ? `${currentMessage} ` : '';
    setCurrentMessage(prefix);
    
    // Scroll to the bottom after a short delay
    setTimeout(() => {
      setAutoScrollToBottom(true);
    }, 100);
    
    // Add a toast notification
    toast.info('Replying to message', { duration: 2000 });
  };
  
  /**
   * Send a reply message
   */
  const sendReplyMessage = (
    content: string,
    userId: number,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
    if (!replyingTo || userRole !== 'vip') return false;
    
    // Get the stored reply text
    const replyText = localStorage.getItem(`replyText_${replyingTo}`);
    
    // Create a unique ID for the new reply message
    const messageId = `reply_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Add the reply message to the local messages immediately for UI responsiveness
    const newReplyMessage: ChatMessage = {
      id: messageId,
      content: content,
      sender: 'You',
      actualUsername: 'You',
      senderId: signalRService.currentUserId,
      recipientId: userId,
      timestamp: new Date(),
      replyToId: replyingTo,
      replyText: replyText || undefined,
      isRead: true,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newReplyMessage]);
    
    // Send the message with the reply information to the server
    signalRService.sendMessage(userId, content, undefined, replyingTo, replyText || undefined)
      .then(() => {
        // Clear the reply state
        setReplyingTo(null);
        
        // Clean up localStorage
        localStorage.removeItem(`replyText_${replyingTo}`);
        
        // Update all messages to clear isBeingRepliedTo flag
        setMessages((prev) => {
          return prev.map(msg => ({ ...msg, isBeingRepliedTo: false }));
        });
        
        return true;
      })
      .catch(error => {
        console.error('Error sending reply:', error);
        toast.error('Failed to send reply');
        return false;
      });
    
    return true;
  };
  
  /**
   * Handle unsending (deleting) a message
   */
  const unsendMessage = (
    messageId: string,
    recipientId: number,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
    // Only VIP users can unsend messages
    if (userRole !== 'vip') {
      toast.error('Only VIP users can unsend messages');
      return;
    }
    
    // Call the SignalR service to delete the message
    signalRService.deleteMessage(messageId, recipientId)
      .then(() => {
        // Update the message in the UI to show it's deleted
        setMessages((prev) => {
          return prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isDeleted: true, content: 'This message has been deleted' }
              : msg
          );
        });
        
        // Add a toast notification
        toast.success('Message unsent successfully', { duration: 2000 });
      })
      .catch(error => {
        console.error('Error unsending message:', error);
        toast.error('Failed to unsend message');
      });
  };
  
  /**
   * Handle clearing the reply state
   */
  const clearReply = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
    // Clear the reply state
    setReplyingTo(null);
    
    // Update all messages to clear isBeingRepliedTo flag
    setMessages((prev) => {
      return prev.map(msg => ({ ...msg, isBeingRepliedTo: false }));
    });
  };
  
  return {
    replyingTo,
    setReplyingTo,
    replyToMessage,
    sendReplyMessage,
    unsendMessage,
    clearReply
  };
};
