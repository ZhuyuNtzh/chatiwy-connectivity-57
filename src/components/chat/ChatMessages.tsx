
import React, { useRef, useEffect } from 'react';
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
  
  useEffect(() => {
    if (autoScrollToBottom && messagesEndRef.current) {
      // Only scroll if we're near the bottom already
      const scrollContainer = messagesEndRef.current.parentElement;
      if (scrollContainer) {
        const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages, autoScrollToBottom]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <ScrollArea className="flex-1 relative">
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
