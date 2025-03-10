
import React from 'react';
import { Eye, EyeOff, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/services/signalR/types';

interface MessageItemProps {
  message: ChatMessage;
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  toggleImageBlur, 
  openImagePreview 
}) => {
  return (
    <div 
      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[80%] rounded-lg p-3 ${
          message.sender === 'You' 
            ? 'bg-primary text-white' 
            : 'bg-gray-100 dark:bg-gray-700'
        }`}
      >
        {message.isImage ? (
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
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        <div className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
