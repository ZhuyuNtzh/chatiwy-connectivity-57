
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { ChatMessage } from '@/services/signalR/types';
import { signalRService } from '@/services/signalRService';

interface HistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatHistory: Record<number, ChatMessage[]>;
  users: Array<{
    id: number;
    username: string;
  }>;
  onContinueChat: (userId: number) => void;
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  isOpen,
  onOpenChange,
  chatHistory,
  users,
  onContinueChat
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  
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
  
  // Sort conversations by most recent message
  const sortedHistoryEntries = Object.entries(chatHistory)
    .map(([userIdStr, messages]) => {
      const userId = parseInt(userIdStr);
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      return {
        userId,
        messages: sortedMessages,
        lastMessageTime: sortedMessages.length > 0 
          ? new Date(sortedMessages[0].timestamp).getTime() 
          : 0
      };
    })
    .filter(entry => entry.messages.length > 0)
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  
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
          <h2 className="text-xl font-semibold">Chat History</h2>
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
          {sortedHistoryEntries.length > 0 ? (
            <div className="space-y-8">
              {sortedHistoryEntries.map(({ userId, messages }) => {
                const user = users.find(u => u.id === userId) || { id: userId, username: `User ${userId}` };
                const currentUserId = signalRService.currentUserId;
                
                // Find chat messages relevant to the current user and this conversation partner
                const relevantMessages = messages.filter(msg => 
                  (msg.senderId === userId && msg.recipientId === currentUserId) || 
                  (msg.senderId === currentUserId && msg.recipientId === userId)
                );
                
                // Skip if there are no relevant messages
                if (relevantMessages.length === 0) return null;
                
                // Sort messages by timestamp
                const sortedRelevantMessages = [...relevantMessages].sort((a, b) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                
                // Get the 3 most recent messages (or all if less than 3)
                const recentMessages = sortedRelevantMessages.slice(0, 3);
                
                return (
                  <div key={userId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{user.username}</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          onContinueChat(userId);
                          onOpenChange(false);
                        }}
                      >
                        Continue Chat
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {recentMessages.reverse().map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-2 text-sm ${
                              msg.senderId === currentUserId 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            {msg.isImage ? (
                              <p className="italic">Image message</p>
                            ) : msg.isDeleted ? (
                              <p className="italic">This message was deleted</p>
                            ) : (
                              <p>{msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content}</p>
                            )}
                            <div className="text-xs opacity-70 mt-1 text-right">
                              {new Date(msg.timestamp).toLocaleString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {sortedRelevantMessages.length > 3 && (
                        <p className="text-center text-xs text-muted-foreground">
                          Showing last 3 of {sortedRelevantMessages.length} messages
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">No chat history yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start a conversation to see it here</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default HistoryDialog;
