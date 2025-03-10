
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ChatMessage } from '@/services/signalR/types';

interface InboxDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inboxMessages: Record<number, ChatMessage[]>;
}

const InboxDialog: React.FC<InboxDialogProps> = ({
  isOpen,
  onOpenChange,
  inboxMessages
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Inbox</DialogTitle>
          <DialogDescription>
            Your messages
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="mt-6 h-96">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">No new messages</p>
            <p className="text-sm text-muted-foreground mt-2">Messages from new users will appear here</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InboxDialog;
