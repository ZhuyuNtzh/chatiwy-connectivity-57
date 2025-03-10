
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/services/signalR/types';

interface InboxDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inboxMessages: Record<number, ChatMessage[]>;
  onOpenChat?: (userId: number) => void;
}

const InboxDialog: React.FC<InboxDialogProps> = ({
  isOpen,
  onOpenChange,
  inboxMessages,
  onOpenChat
}) => {
  // Convert Record to array for easier rendering
  const messagesArray = Object.entries(inboxMessages).map(([userId, messages]) => ({
    userId: parseInt(userId),
    messages,
    lastMessage: messages[messages.length - 1],
    sender: messages[0]?.sender !== 'You' ? messages[0]?.sender : 'Unknown'
  }));

  const hasMessages = messagesArray.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inbox</DialogTitle>
          <DialogDescription>
            Your conversations
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-6 h-96">
          {hasMessages ? (
            <div className="space-y-4">
              {messagesArray.map(({ userId, messages, lastMessage, sender }) => (
                <div 
                  key={userId} 
                  className="flex items-start p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                  onClick={() => onOpenChat && onOpenChat(userId)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      {sender.substring(0, 1).toUpperCase()}
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium truncate">{sender}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage.isImage ? '🖼️ Image' : lastMessage.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">No new messages</p>
              <p className="text-sm text-muted-foreground mt-2">Messages from new users will appear here</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InboxDialog;
