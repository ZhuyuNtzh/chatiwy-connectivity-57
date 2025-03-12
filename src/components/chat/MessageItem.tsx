
import React, { useState } from 'react';
import { Eye, EyeOff, Maximize2, MessageSquare, Check, CheckCheck, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/services/signalR/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MessageItemProps {
  message: ChatMessage;
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
  showMessageStatus?: boolean;
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉'];

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  toggleImageBlur, 
  openImagePreview,
  showMessageStatus = false
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  
  const handleReaction = (emoji: string) => {
    setReaction(emoji);
    setShowReactionPicker(false);
  };
  
  const handleStartReply = () => {
    setIsReplying(true);
    setReplyTo(message);
  };
  
  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyText('');
    setReplyTo(null);
  };
  
  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log('Sending reply:', replyText, 'to message:', message.id);
      // Here you would integrate with your signalR service
      setIsReplying(false);
      setReplyText('');
      setReplyTo(null);
    }
  };
  
  // Render message status indicator for VIP users
  const renderMessageStatus = () => {
    if (!showMessageStatus || message.sender !== 'You') return null;
    
    // Simulate random statuses for demo
    const status = Math.random() > 0.7 ? 'read' : Math.random() > 0.4 ? 'delivered' : 'sent';
    
    return (
      <span className="ml-1">
        {status === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
        {status === 'delivered' && <CheckCheck className="h-3 w-3 text-gray-400" />}
        {status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
      </span>
    );
  };
  
  return (
    <div className="relative group">
      {/* Reply reference */}
      {message.replyToId && (
        <div className={`mb-1 ml-6 p-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg max-w-[80%] ${message.sender === 'You' ? 'ml-auto mr-6' : ''}`}>
          <div className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Replying to</span>
          </div>
          <div className="mt-0.5 line-clamp-1">{message.replyText || "Previous message"}</div>
        </div>
      )}
      
      {/* Message */}
      <div 
        className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
      >
        <div 
          className={`max-w-[80%] rounded-lg p-3 ${
            message.sender === 'You' 
              ? 'bg-primary text-white dark:bg-primary' 
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
          ) : message.isVoiceMessage ? (
            <div className="audio-player">
              <audio controls src={message.audioUrl} className="w-full max-w-[200px]" />
            </div>
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          <div className="text-xs opacity-70 mt-1 text-right flex justify-end items-center">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {renderMessageStatus()}
          </div>
        </div>
      </div>
      
      {/* Reaction shown if selected */}
      {reaction && (
        <div className={`absolute -bottom-2 ${message.sender === 'You' ? 'right-2' : 'left-2'}`}>
          <span className="text-lg bg-white dark:bg-gray-800 rounded-full px-1 py-0.5 shadow-sm">{reaction}</span>
        </div>
      )}
      
      {/* VIP Actions Menu */}
      {showMessageStatus && (
        <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity ${message.sender === 'You' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}`}>
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
            <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 dark:bg-gray-800" align="center">
                <div className="flex gap-1">
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
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStartReply}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Reply input */}
      {isReplying && (
        <div className={`mt-2 mb-4 ${message.sender === 'You' ? 'ml-10' : 'mr-10'}`}>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-700"
            />
            <Button size="sm" variant="ghost" onClick={handleCancelReply}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
