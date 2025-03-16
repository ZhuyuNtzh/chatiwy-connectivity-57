
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
    
    // Store the messageText in localStorage temporarily so we can reference it when sending
    localStorage.setItem(`replyText_${messageId}`, messageText);
    
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
    unsendMessage,
    clearReply
  };
};
