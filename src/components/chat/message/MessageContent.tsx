
import React from 'react';
import { Eye, EyeOff, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/services/signalR/types';

interface MessageContentProps {
  message: ChatMessage;
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  message, 
  toggleImageBlur, 
  openImagePreview 
}) => {
  if (message.isImage) {
    return (
      <div className="relative">
        <img 
          src={message.imageUrl} 
          alt="Shared image" 
          className={`max-w-full rounded cursor-pointer ${message.isBlurred ? 'blur-xl' : ''}`}
          onClick={() => !message.isBlurred && openImagePreview(message.imageUrl || '')}
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleImageBlur(message.id)}
          >
            {message.isBlurred ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {message.isBlurred ? 'Reveal' : 'Blur'}
          </Button>
          {!message.isBlurred && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openImagePreview(message.imageUrl || '')}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
        </div>
      </div>
    );
  } 
  
  if (message.isVoiceMessage) {
    return (
      <div className="audio-player">
        <audio controls src={message.audioUrl} className="w-full max-w-[200px]" />
      </div>
    );
  }
  
  return <p className="text-sm">{message.content}</p>;
};

export default MessageContent;
