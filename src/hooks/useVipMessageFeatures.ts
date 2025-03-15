
import { useState, useCallback } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { toast } from "sonner";

export const useVipMessageFeatures = (userRole: string) => {
  const [replyingTo, setReplyingTo] = useState<{id: string, text: string} | null>(null);
  
  // Handle replying to messages
  const replyToMessage = useCallback((
    messageId: string, 
    messageText: string, 
    currentMessage: string,
    setMessage: (value: string) => void,
    setMessages: (updater: (messages: ChatMessage[]) => ChatMessage[]) => void,
    recipientId: number,
    setAutoScrollToBottom: (value: boolean) => void
  ) => {
    // VIP-only feature check
    if (userRole !== 'vip') {
      toast.error("This feature is only available for VIP members");
      return;
    }
    
    // Set reply context
    setReplyingTo({ id: messageId, text: messageText });
    
    // Focus input field for the user to type
    setMessage(currentMessage); // Keep existing content
    
    // Update messages array to show the reply-to state
    setMessages(messages => messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, isReplyingTo: true } 
        : msg
    ));
    
    // Scroll to input field
    setAutoScrollToBottom(true);
  }, [userRole]);
  
  // Handle unsending (deleting) messages
  const unsendMessage = useCallback((
    messageId: string,
    recipientId: number,
    setMessages: (updater: (messages: ChatMessage[]) => ChatMessage[]) => void
  ) => {
    // VIP-only feature check
    if (userRole !== 'vip') {
      toast.error("This feature is only available for VIP members");
      return;
    }
    
    // Call SignalR service to delete the message
    signalRService.deleteMessage(messageId, recipientId);
    
    // Update UI immediately
    setMessages(messages => messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, isDeleted: true, content: "This message was unsent" } 
        : msg
    ));
    
    toast.success("Message unsent successfully");
  }, [userRole]);
  
  // Send a message with reply context
  const sendReplyMessage = useCallback((
    content: string,
    recipientId: number,
    setReplyingTo: (value: {id: string, text: string} | null) => void,
    setMessages: (updater: (messages: ChatMessage[]) => ChatMessage[]) => void
  ) => {
    if (!replyingTo) return null;
    
    // Create message with reply metadata
    const message = {
      content,
      replyToId: replyingTo.id,
      replyText: replyingTo.text.substring(0, 50) + (replyingTo.text.length > 50 ? '...' : '')
    };
    
    // Clear reply state
    setReplyingTo(null);
    
    // Reset reply UI
    setMessages(messages => messages.map(msg => 
      msg.isReplyingTo ? { ...msg, isReplyingTo: false } : msg
    ));
    
    return message;
  }, [replyingTo]);
  
  return {
    replyingTo,
    setReplyingTo,
    replyToMessage,
    unsendMessage,
    sendReplyMessage
  };
};
