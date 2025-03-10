
import React, { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage } from '../../services/signalR/types';
import MessageItem from './MessageItem';

interface ChatMessagesProps {
  messages: ChatMessage[];
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
  autoScrollToBottom: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  toggleImageBlur,
  openImagePreview,
  autoScrollToBottom
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  
  // Track user scroll events
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (!messagesEndRef.current) return;
      
      const scrollContainer = (e.target as HTMLElement);
      const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
      
      // If user scrolls up manually, mark it
      if (scrollHeight - scrollTop - clientHeight > 50) {
        setUserScrolledUp(true);
      } else {
        setUserScrolledUp(false);
      }
    };
    
    const scrollArea = document.querySelector('.scroll-area-viewport');
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  useEffect(() => {
    if (autoScrollToBottom && messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.parentElement;
      if (scrollContainer) {
        const { scrollHeight, scrollTop, clientHeight } = scrollContainer;

        // Revised "near bottom" check (within 5% of the bottom)
        const bottomThreshold = scrollHeight * 0.05; // 5% of total height
        const isNearBottom = scrollHeight - scrollTop - clientHeight <= bottomThreshold;

        if (isNearBottom && !userScrolledUp) {
          // Only scroll if near bottom AND user hasn't scrolled up
          if((scrollHeight - scrollTop - clientHeight) !== 0){
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  }, [messages, autoScrollToBottom, userScrolledUp]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full scroll-area">
        <div className="p-4 space-y-4">
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id}
              message={msg}
              toggleImageBlur={toggleImageBlur}
              openImagePreview={openImagePreview}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
