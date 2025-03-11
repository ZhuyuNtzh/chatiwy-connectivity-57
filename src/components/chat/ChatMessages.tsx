
import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../../services/signalR/types';
import MessageItem from './MessageItem';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessagesProps {
  messages: ChatMessage[];
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
  autoScrollToBottom: boolean;
  updateScrollPosition?: (isAtBottom: boolean) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  toggleImageBlur,
  openImagePreview,
  autoScrollToBottom,
  updateScrollPosition
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const previousMessagesLengthRef = useRef(messages.length);
  
  // Detect when user scrolls up manually
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 5;
      
      // Update local scroll state
      setUserScrolledUp(!isAtBottom);
      
      // Update the parent component about scroll position
      if (updateScrollPosition) {
        updateScrollPosition(isAtBottom);
      }
      
      // If user scrolls to bottom, reset new message counter
      if (isAtBottom) {
        setNewMessageCount(0);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [updateScrollPosition]);
  
  // Count new messages when user has scrolled up
  useEffect(() => {
    if (userScrolledUp && !autoScrollToBottom && messages.length > previousMessagesLengthRef.current) {
      setNewMessageCount(prev => prev + (messages.length - previousMessagesLengthRef.current));
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length, userScrolledUp, autoScrollToBottom]);
  
  // Reset counter when auto-scrolling
  useEffect(() => {
    if (autoScrollToBottom) {
      setNewMessageCount(0);
    }
  }, [autoScrollToBottom]);
  
  // Scroll to bottom only when new messages arrive and user hasn't scrolled up or autoScroll is triggered
  useEffect(() => {
    if ((!userScrolledUp || autoScrollToBottom) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolledUp, autoScrollToBottom]);

  // Handle manual scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessageCount(0);
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative h-[calc(100vh-13rem)]">
      <ScrollArea
        className="h-full"
      >
        <div 
          ref={scrollContainerRef} 
          className="p-4 space-y-4"
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
      </ScrollArea>
      
      {/* Scroll to bottom button with new message count */}
      {userScrolledUp && newMessageCount > 0 && (
        <div className="absolute bottom-4 right-4">
          <Button 
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full p-2 flex items-center gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            {newMessageCount > 1 ? `${newMessageCount} new messages` : '1 new message'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
