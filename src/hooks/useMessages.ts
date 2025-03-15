
import { useState } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { toast } from "sonner";
import { useUser } from '@/contexts/UserContext';

export const useMessages = (userId: number, userRole: string) => {
  const [message, setMessage] = useState('');
  const { currentUser } = useUser();
  const maxChars = userRole === 'vip' ? 200 : 140;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(userId)) {
      toast.error(`You have blocked this user and cannot send messages.`);
      return;
    }
    
    // Create a message with the correct username from currentUser
    const username = currentUser?.username || 'You';
    
    // Send via signalRService
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

  return {
    message,
    setMessage,
    maxChars,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji,
  };
};
