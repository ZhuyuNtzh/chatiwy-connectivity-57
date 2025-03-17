
import { useRef } from 'react';
import { signalRService } from '@/services/signalRService';

export const useMessageSending = (userId: number, setMessage: React.Dispatch<React.SetStateAction<string>>) => {
  const handleSendMessage = (e?: React.FormEvent, message: string = '') => {
    if (e) e.preventDefault();
    
    // Don't send empty messages
    if (!message.trim()) return;
    
    // Create a unique ID for the message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Send using signalR service
    signalRService.sendMessage(userId, message.trim());
    
    // Clear input field
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, message: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(undefined, message);
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
