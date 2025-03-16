
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Mail } from 'lucide-react';
import type { ChatMessage } from '@/services/signalR/types';
import { signalRService } from '@/services/signalRService';

interface InboxDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inboxMessages: Record<number, ChatMessage[]>;
  onOpenChat: (userId: number) => void;
  onDialogOpened?: () => void;
  unreadBySender?: Record<number, boolean>;
}

const InboxDialog: React.FC<InboxDialogProps> = ({
  isOpen,
  onOpenChange,
  inboxMessages,
  onOpenChat,
  onDialogOpened,
  unreadBySender = {}
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  // Call onDialogOpened when the dialog opens
  useEffect(() => {
    if (isOpen && onDialogOpened) {
      onDialogOpened();
    }
  }, [isOpen, onDialogOpened]);
  
  // Handle outside clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && backdropRef.current && !sidebarRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(false);
      }
    };
    
    // Handle escape key
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);
    
    // If the dialog is open, prevent body scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onOpenChange]);
  
  if (!isOpen) return null;
  
  const sortedInboxEntries = Object.entries(inboxMessages)
    .map(([senderId, messages]) => {
      const userIdNum = parseInt(senderId);
      const currentUserId = signalRService.currentUserId;
      
      // For each user, filter messages to only include those sent TO the current user
      const incomingMessages = messages.filter(msg => 
        msg.recipientId === currentUserId && msg.senderId === userIdNum
      );
      
      // Skip if no incoming messages
      if (incomingMessages.length === 0) return null;
      
      // Sort messages by timestamp (newest first)
      const sortedMessages = [...incomingMessages].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      const lastMessage = sortedMessages[0];
      
      // Skip if no last message
      if (!lastMessage) return null;
      
      return {
        senderId: userIdNum,
        lastMessage,
        messages: sortedMessages,
        timestamp: new Date(lastMessage.timestamp).getTime()
      };
    })
    .filter(Boolean) // Remove null entries
    .sort((a, b) => b!.timestamp - a!.timestamp); // Sort by most recent first
  
  const hasMessages = sortedInboxEntries.length > 0;
  
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-[101] flex flex-col"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Inbox</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {hasMessages ? (
            <div className="space-y-6">
              {sortedInboxEntries.map((entry) => {
                if (!entry) return null;
                
                const { senderId, lastMessage, messages } = entry;
                const isUnread = unreadBySender[senderId] || false;
                const senderName = lastMessage.sender;
                
                return (
                  <div 
                    key={senderId} 
                    className={`p-3 rounded-lg border ${isUnread ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {isUnread && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full mr-2"></div>
                        )}
                        <h3 className={`font-medium ${isUnread ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                          {senderName}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(lastMessage.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                      {lastMessage.isImage ? (
                        <span className="flex items-center text-gray-500 italic">
                          <Mail className="h-3 w-3 mr-1" /> Image attachment
                        </span>
                      ) : lastMessage.isDeleted ? (
                        <span className="text-gray-400 italic">This message was deleted</span>
                      ) : (
                        lastMessage.content
                      )}
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        onOpenChat(senderId);
                        onOpenChange(false);
                      }}
                    >
                      Open Chat
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <Mail className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Your inbox is empty</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Messages from other users will appear here
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default InboxDialog;
