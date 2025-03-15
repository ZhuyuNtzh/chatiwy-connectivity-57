
import React from 'react';
import { Smile, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MessageActionsProps {
  isFromCurrentUser: boolean;
  showReactionPicker: boolean;
  setShowReactionPicker: (show: boolean) => void;
  handleReaction: (emoji: string) => void;
  handleStartReply: () => void;
  isVip: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉'];

const MessageActions: React.FC<MessageActionsProps> = ({
  isFromCurrentUser,
  showReactionPicker,
  setShowReactionPicker,
  handleReaction,
  handleStartReply,
  isVip,
  setIsDeleteDialogOpen
}) => {
  return (
    <div className={`absolute bottom-0 ${isFromCurrentUser ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
        <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 dark:bg-gray-800" align="center">
            <div className="flex gap-1 flex-wrap max-w-[180px]">
              {commonReactions.map((emoji, i) => (
                <Button 
                  key={i} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleStartReply}>
          <MessageSquare className="h-4 w-4" />
        </Button>
        
        {/* Unsend message button (only for VIP users and own messages) */}
        {isVip && isFromCurrentUser && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageActions;
