
import { signalRService } from '@/services/signalRService';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useVipMessageFeatures = (userRole: string) => {
  const replyToMessage = (
    messageId: string, 
    messageText: string,
    message: string,
    setMessage: (msg: string) => void,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    userId: number,
    setAutoScrollToBottom: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (userRole !== 'vip') {
      toast.error('Replying to messages is a VIP feature');
      return;
    }
    
    // Find the message we're replying to in the messages array that's passed in
    const replyMessage = signalRService.getChatHistory(userId)?.find(msg => msg.id === messageId);
    if (!replyMessage) return;
    
    // Create a truncated version of the original message for the reply reference
    const replyText = messageText.length > 50 
      ? messageText.substring(0, 50) + '...' 
      : messageText;
    
    // Send a new message with a reference to the original
    const newMessage: ChatMessage = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: message.trim(),
      sender: 'You',
      senderId: signalRService.currentUserId,
      recipientId: userId,
      timestamp: new Date(),
      replyToId: messageId,
      replyText: replyText
    };
    
    // Add the message to our local messages
    setMessages(prev => [...prev, newMessage]);
    
    // Clear the input field
    setMessage('');
    
    // Auto-scroll to the new message
    setAutoScrollToBottom(true);
    setTimeout(() => setAutoScrollToBottom(false), 300);
  };
  
  const unsendMessage = (
    messageId: string,
    userId: number,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) => {
    if (userRole !== 'vip') {
      toast.error('Unsending messages is a VIP feature');
      return;
    }
    
    // Find the message we're unsending
    const message = signalRService.getChatHistory(userId)?.find(msg => msg.id === messageId);
    if (!message) return;
    
    // Only allow unsending your own messages
    if (message.sender !== 'You') {
      toast.error('You can only unsend your own messages');
      return;
    }
    
    // Send the unsend request to the server
    signalRService.deleteMessage(messageId, userId);
    
    // Update the local state
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true } 
          : msg
      )
    );
    
    toast.success('Message unsent');
  };

  return {
    replyToMessage,
    unsendMessage
  };
};
