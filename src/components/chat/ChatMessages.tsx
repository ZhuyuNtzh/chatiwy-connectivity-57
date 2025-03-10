
import React, { useRef, useEffect, useState } from 'react';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  
  // Detect when user scrolls up manually
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 5;
      setUserScrolledUp(!isAtBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Scroll to bottom only when new messages arrive and user hasn't scrolled up or autoScroll is triggered
  useEffect(() => {
    if ((!userScrolledUp || autoScrollToBottom) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolledUp, autoScrollToBottom]);

  return (
    <div className="flex-1 overflow-hidden">
      <div 
        ref={scrollContainerRef} 
        className="h-full overflow-y-auto p-4 space-y-4"
      >
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
    </div>
  );
};

export default ChatMessages;
