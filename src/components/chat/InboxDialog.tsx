
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage } from '@/services/signalR/types';
import { signalRService } from '@/services/signalRService';

interface InboxDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inboxMessages: Record<number, ChatMessage[]>;
  onOpenChat?: (userId: number) => void;
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
  // When the dialog opens, notify parent to mark inbox as viewed
  useEffect(() => {
    if (isOpen && onDialogOpened) {
      onDialogOpened();
    }
  }, [isOpen, onDialogOpened]);

  // Filter the inboxMessages to only show conversations where we received messages
  const currentUserId = signalRService.currentUserId;
  
  // Convert Record to array for easier rendering and ensure each conversation only shows relevant messages
  const messagesArray = Object.entries(inboxMessages)
    .map(([userId, messages]) => {
      // Filter messages that were actually sent to the current user
      const receivedMessages = messages.filter(msg => 
        msg.recipientId === currentUserId && 
        msg.senderId.toString() === userId
      );
      
      // Skip if there are no messages from this sender
      if (receivedMessages.length === 0) return null;
      
      // Find the sender name from the messages
      const sender = receivedMessages[0].sender;
      const senderId = parseInt(userId);
      const isUnread = unreadBySender[senderId] === true;
      
      return {
        userId: senderId,
        messages: receivedMessages,
        lastMessage: receivedMessages[receivedMessages.length - 1],
        sender,
        isUnread
      };
    })
    .filter(Boolean); // Remove null entries

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
              {messagesArray.map((item) => {
                if (!item) return null;
                const { userId, lastMessage, sender, isUnread } = item;
                
                return (
                  <div 
                    key={userId} 
                    className={`flex items-start p-3 ${isUnread ? 'bg-gray-50 dark:bg-gray-800' : ''} hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer relative`}
                    onClick={() => onOpenChat && onOpenChat(userId)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        {sender.substring(0, 1).toUpperCase()}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <p className={`${isUnread ? 'font-semibold' : 'font-medium'} truncate`}>{sender}</p>
                          {isUnread && (
                            <span className="ml-2">
                              <Badge 
                                variant="destructive" 
                                className="h-2.5 w-2.5 p-0 rounded-full"
                              />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className={`text-sm ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'} truncate`}>
                        {lastMessage.isImage ? '🖼️ Image' : lastMessage.content}
                      </p>
                    </div>
                  </div>
                );
              })}
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
