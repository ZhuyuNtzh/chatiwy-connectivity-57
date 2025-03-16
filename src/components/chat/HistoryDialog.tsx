
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chat History</DialogTitle>
          <DialogDescription>
            Your recent conversations
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-6 h-96">
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
                        onClick={() => onContinueChat(userId)}
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
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
