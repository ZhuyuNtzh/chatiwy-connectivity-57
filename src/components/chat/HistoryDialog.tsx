
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { ChatMessage } from '@/services/signalR/types';

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
          {Object.keys(chatHistory).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(chatHistory).map(([userIdStr, messages]) => {
                const userId = parseInt(userIdStr);
                const user = users.find(u => u.id === userId) || { id: userId, username: `Unknown User ${userId}` };
                
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
                      {messages.slice(-3).map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-2 text-sm ${
                              msg.sender === 'You' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            {msg.isImage ? (
                              <p className="italic">Image message</p>
                            ) : (
                              <p>{msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content}</p>
                            )}
                            <div className="text-xs opacity-70 mt-1 text-right">
                              {new Date(msg.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {messages.length > 3 && (
                        <p className="text-center text-xs text-muted-foreground">
                          Showing {messages.length > 3 ? 'last 3 of ' + messages.length : messages.length} messages
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
