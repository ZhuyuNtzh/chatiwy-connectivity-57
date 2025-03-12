import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '@/services/signalR/types';
import MessageItem from './MessageItem';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
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
            showMessageStatus={isVip}
            onReply={onReplyToMessage}
            onUnsendMessage={isVip ? onUnsendMessage : undefined}
          />
        ))}
        
        {isVip && isTyping && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-700">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <div className="text-xs opacity-70 mt-1 text-gray-500 dark:text-gray-400">typing...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
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
