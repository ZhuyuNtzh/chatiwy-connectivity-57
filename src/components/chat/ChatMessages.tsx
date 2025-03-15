
import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '@/services/signalR/types';
import MessageItem from './MessageItem';
import ScrollContainer from './message/ScrollContainer';
import TypingIndicator from './message/TypingIndicator';
import NewMessageNotification from './message/NewMessageNotification';
import { useUser } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';

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
  const { userRole, currentUser } = useUser();
  const isVip = userRole === 'vip';
  
  // Get current user ID safely from signalRService
  const currentUserId = signalRService.currentUserId;
  
  // Filter messages to ensure we only show those for the current conversation
  const currentUserMessages = messages.filter(msg => {
    // If no selectedUserId is provided, show all messages
    if (!selectedUserId) return true;
    
    // Only show messages that are part of the current conversation
    return (msg.senderId === selectedUserId && msg.recipientId === currentUserId) || 
           (msg.senderId === currentUserId && msg.recipientId === selectedUserId);
  });
  
  // Log to debug message filtering
  console.log('All messages:', messages);
  console.log('Filtered messages:', currentUserMessages);
  console.log('CurrentUserId:', currentUserId);
  console.log('SelectedUserId:', selectedUserId);
  
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
    if (userScrolledUp && !autoScrollToBottom && currentUserMessages.length > previousMessagesLengthRef.current) {
      setNewMessageCount(prev => prev + (currentUserMessages.length - previousMessagesLengthRef.current));
    }
    previousMessagesLengthRef.current = currentUserMessages.length;
  }, [currentUserMessages.length, userScrolledUp, autoScrollToBottom]);
  
  useEffect(() => {
    if (autoScrollToBottom) {
      setNewMessageCount(0);
    }
  }, [autoScrollToBottom]);
  
  useEffect(() => {
    if ((!userScrolledUp || autoScrollToBottom) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentUserMessages, userScrolledUp, autoScrollToBottom]);

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
        {currentUserMessages.map((msg) => (
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
