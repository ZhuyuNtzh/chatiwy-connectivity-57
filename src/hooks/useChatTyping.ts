
import { useState, useRef, useEffect } from 'react';
import { signalRService } from '@/services/signalRService';

export const useChatTyping = (userId: number, userRole: string) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const handleUserTyping = (typingUserId: number) => {
      if (typingUserId === userId && userRole === 'vip') {
        setIsTyping(true);
        
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        
        typingTimerRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };
    
    signalRService.onUserTyping(handleUserTyping);
    
    return () => {
      signalRService.offUserTyping(handleUserTyping);
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [userId, userRole]);
  
  return { isTyping };
};
