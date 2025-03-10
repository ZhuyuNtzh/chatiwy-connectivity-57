
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Send, Mic } from 'lucide-react';
import { useUser, UserRole } from '../contexts/UserContext';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onSendImage?: (file: File) => void;
  onRecordVoice?: () => void;
}

const ChatInput = ({ onSendMessage, onSendImage, onRecordVoice }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userRole } = useUser();
  
  const maxChars = userRole === 'vip' ? 200 : 140;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendImage) {
      onSendImage(file);
    }
  };
  
  const isVoiceAvailable = userRole === 'vip' && onRecordVoice;
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="glass-input pr-24 min-h-[60px] max-h-32 rounded-xl transition-all duration-300"
          maxLength={maxChars}
        />
        
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10"
            onClick={handleImageClick}
          >
            <Image className="h-4 w-4" />
          </Button>
          
          {isVoiceAvailable && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-primary/10"
              onClick={onRecordVoice}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {message.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {message.length}/{maxChars}
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </form>
  );
};

export default ChatInput;
