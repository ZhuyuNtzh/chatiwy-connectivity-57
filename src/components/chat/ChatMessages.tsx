
import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '@/services/signalR/types';
import MessageItem from './MessageItem';
import ScrollContainer from './message/ScrollContainer';
import TypingIndicator from './message/TypingIndicator';
import NewMessageNotification from './message/NewMessageNotification';
import { useUser } from '@/contexts/UserContext';

interface ChatMessagesProps {
  messages: ChatMessage[];
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
  autoScrollToBottom: boolean;
  updateScrollPosition?: (isAtBottom: boolean) => void;
  isTyping?: boolean;
  selectedUserId?: number;
  onReplyToMessage?: (messageId: string, messageText: string) => void;
  onUnsendMessage?: (messageId: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  toggleImageBlur,
  openImagePreview,
  autoScrollToBottom,
  updateScrollPosition,
  isTyping = false,
  selectedUserId,
  onReplyToMessage,
  onUnsendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const previousMessagesLengthRef = useRef(messages.length);
  const { userRole } = useUser();
  const isVip = userRole === 'vip';
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 5;
      
      setUserScrolledUp(!isAtBottom);
      
      if (updateScrollPosition) {
        updateScrollPosition(isAtBottom);
      }
      
      if (isAtBottom) {
        setNewMessageCount(0);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [updateScrollPosition]);
  
  useEffect(() => {
    if (userScrolledUp && !autoScrollToBottom && messages.length > previousMessagesLengthRef.current) {
      setNewMessageCount(prev => prev + (messages.length - previousMessagesLengthRef.current));
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length, userScrolledUp, autoScrollToBottom]);
  
  useEffect(() => {
    if (autoScrollToBottom) {
      setNewMessageCount(0);
    }
  }, [autoScrollToBottom]);
  
  useEffect(() => {
    if ((!userScrolledUp || autoScrollToBottom) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, userScrolledUp, autoScrollToBottom]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessageCount(0);
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative h-[calc(100vh-13rem)]">
      <ScrollContainer 
        scrollRef={scrollContainerRef}
      >
        {messages.map((msg) => (
          <MessageItem 
            key={msg.id}
            message={msg}
            toggleImageBlur={toggleImageBlur}
            openImagePreview={openImagePreview}
            showMessageStatus={isVip}
            onReply={onReplyToMessage}
            onUnsendMessage={isVip ? onUnsendMessage : undefined}
          />
        ))}
        
        {isVip && isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </ScrollContainer>
      
      {userScrolledUp && newMessageCount > 0 && (
        <NewMessageNotification 
          count={newMessageCount} 
          onScrollToBottom={scrollToBottom} 
        />
      )}
    </div>
  );
};

export default ChatMessages;
