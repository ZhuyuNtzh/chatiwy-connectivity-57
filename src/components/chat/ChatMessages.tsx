
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
  
  // Track when user scrolls up manually
  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.parentElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isUserAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 5;
      
      setUserScrolledUp(!isUserAtBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Handle scrolling when messages change
  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.parentElement;
    if (!scrollContainer) return;

    const { scrollHeight, scrollTop, clientHeight } = scrollContainer;

    // Check if user is already at the bottom
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 5;

    // Only auto-scroll when user is at bottom or when explicitly requested and user hasn't manually scrolled up
    if ((isAtBottom || autoScrollToBottom) && !userScrolledUp) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
