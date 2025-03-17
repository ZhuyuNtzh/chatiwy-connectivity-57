
import { useState } from 'react';
import type { ChatMessage } from '@/services/signalR/types';

export const useMessageState = (userRole: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const maxChars = userRole === 'vip' ? 1000 : 500;

  return {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars
  };
};
