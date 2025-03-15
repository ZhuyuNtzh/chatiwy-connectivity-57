
import { useState } from 'react';
import { signalRService } from '@/services/signalRService';
import { toast } from 'sonner';
import type { ChatMessage } from '@/services/signalR/types';

/**
 * Hook that provides VIP message features like replying and unsending messages
 */
export const useVipMessageFeatures = (userRole: string) => {
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null);
  const [replyingToMessageText, setReplyingToMessageText] = useState<string>('');

  /**
   * Handle replying to a message
   */
  const replyToMessage = (
    messageId: string,
    messageText: string,
    currentMessage: string,
    setMessage: (message: string) => void,
    setMessages: (messages: ChatMessage[]) => void,
    recipientId: number,
    setAutoScrollToBottom: (autoScroll: boolean) => void
  ) => {
    // Only VIP users can reply to messages
    if (userRole !== 'vip') {
      toast.error('Only VIP users can reply to messages');
      return;
    }

    // Set the reply info
    setReplyingToMessageId(messageId);
    setReplyingToMessageText(messageText);

    // Focus the input field
    setMessage(`${currentMessage}`);

    // Modify message in the UI to show it's being replied to
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isBeingRepliedTo: true } 
        : msg
    ));

    // Handle sending the reply
    const handleSendReply = (content: string) => {
      if (!replyingToMessageId) return;

      const truncatedReplyText = messageText.length > 50 
        ? `${messageText.substring(0, 50)}...` 
        : messageText;

      // Send the message with reply metadata
      signalRService.sendMessage(
        recipientId,
        content,
        undefined, // Use default username
        replyingToMessageId,
        truncatedReplyText
      );

      // Reset reply state
      setReplyingToMessageId(null);
      setReplyingToMessageText('');

      // Auto-scroll to see the new message
      setAutoScrollToBottom(true);
      setTimeout(() => setAutoScrollToBottom(false), 300);

      return true;
    };

    return handleSendReply;
  };

  /**
   * Handle unsending (deleting) a message
   */
  const unsendMessage = (
    messageId: string,
    recipientId: number,
    setMessages: (messages: ChatMessage[]) => void
  ) => {
    // Only VIP users can unsend messages
    if (userRole !== 'vip') {
      toast.error('Only VIP users can unsend messages');
      return;
    }

    // Update UI immediately to show message is deleted
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isDeleted: true } 
        : msg
    ));

    // Delete the message from the service
    signalRService.deleteMessage(messageId, recipientId)
      .then(() => {
        toast.success('Message unsent successfully');
      })
      .catch(() => {
        // Revert UI if there was an error
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: false } 
            : msg
        ));
        toast.error('Failed to unsend message');
      });
  };

  return {
    replyToMessage,
    unsendMessage,
    replyingToMessageId,
    replyingToMessageText,
  };
};
