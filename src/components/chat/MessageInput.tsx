
import React, { useRef } from 'react';
import { Send, Image, Mic, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  maxChars: number;
  handleSendMessage: (e?: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleAddEmoji: (emoji: string) => void;
  handleImageClick: () => void;
  isUserBlocked: boolean;
  isVipUser: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
];

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  maxChars,
  handleSendMessage,
  handleKeyDown,
  handleAddEmoji,
  handleImageClick,
  isUserBlocked,
  isVipUser,
  fileInputRef
}) => {
  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start" alignOffset={-40}>
          <div className="grid grid-cols-8 gap-1">
            {commonEmojis.map((emoji, i) => (
              <Button
                key={i}
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => handleAddEmoji(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
      />
      
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 shrink-0"
        onClick={handleImageClick}
      >
        <Image className="h-5 w-5" />
      </Button>
      
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 shrink-0"
        disabled={!isVipUser}
        title={!isVipUser ? "VIP feature" : "Voice message"}
      >
        <Mic className="h-5 w-5" />
      </Button>
      
      <div className="relative flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="pr-16"
          maxLength={maxChars}
          disabled={isUserBlocked}
        />
        <div className="absolute right-2 bottom-1 text-xs text-gray-400">
          {message.length}/{maxChars}
        </div>
      </div>
      
      <Button 
        type="submit" 
        size="icon" 
        disabled={!message.trim() || isUserBlocked}
        className="h-9 w-9 shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
