
import { useRef } from 'react';
import { signalRService } from '@/services/signalRService';

export const useMessageSending = (userId: number, setMessage: (message: string) => void) => {
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Create a unique ID for the message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji
  };
};
