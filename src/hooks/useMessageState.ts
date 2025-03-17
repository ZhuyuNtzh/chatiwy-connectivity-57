
import { useState } from 'react';
import type { ChatMessage } from '@/services/signalR/types';

export const useMessageState = (userRole: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  // Fix the character limits back to original values
  const maxChars = userRole === 'vip' ? 200 : 140;

  return {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars
  };
};
