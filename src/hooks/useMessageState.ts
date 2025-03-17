
import { useState } from 'react';
import type { ChatMessage } from '@/services/signalR/types';

export const useMessageState = (userRole: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  // Set character limits to correct values
  const maxChars = userRole === 'vip' ? 200 : 140;

  return {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars
  };
};
