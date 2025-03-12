import React, { useState } from 'react';
import { Eye, EyeOff, Maximize2, MessageSquare, Check, CheckCheck, Smile, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/services/signalR/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser } from '@/contexts/UserContext';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface MessageItemProps {
  message: ChatMessage;
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
  showMessageStatus?: boolean;
  onReply?: (messageId: string, messageText: string) => void;
  onUnsendMessage?: (messageId: string) => void;
}

const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🎉'];

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  toggleImageBlur, 
  openImagePreview,
  showMessageStatus = false,
  onReply,
  onUnsendMessage
}) => {
  const { userRole } = useUser();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const isFromCurrentUser = message.sender === 'You';
  const isVip = userRole === 'vip';
  
  const handleReaction = (emoji: string) => {
    setReaction(emoji);
    setShowReactionPicker(false);
  };
  
  const handleStartReply = () => {
    setIsReplying(true);
  };
  
  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyText('');
  };
  
  const handleSendReply = () => {
    if (replyText.trim() && onReply) {
      onReply(message.id, message.content || '');
      setIsReplying(false);
      setReplyText('');
    }
  };
  
  const handleConfirmUnsend = () => {
    if (onUnsendMessage) {
      onUnsendMessage(message.id);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };
  
  // Don't render if message is deleted
  if (message.isDeleted) {
    return (
      <div className="relative group mb-4">
        <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-lg p-3 ${
            isFromCurrentUser
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' 
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            <p className="text-sm italic">This message has been deleted</p>
          </div>
        </div>
      </div>
    );
  }
  
  const renderMessageStatus = () => {
    if (!showMessageStatus || !isFromCurrentUser) return null;
    
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
    <div className="relative group mb-4">
      {/* Reply reference */}
      {message.replyToId && (
        <div className={`mb-1 p-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg max-w-[80%] ${isFromCurrentUser ? 'ml-auto mr-6' : 'ml-6'}`}>
          <div className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Replying to</span>
          </div>
          <div className="mt-0.5 line-clamp-1">{message.replyText || "Previous message"}</div>
        </div>
      )}
      
      {/* Message */}
      <div 
        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div 
          className={`max-w-[80%] rounded-lg p-3 ${
            isFromCurrentUser 
              ? 'bg-primary text-white dark:bg-primary' 
              : 'bg-gray-100 dark:bg-gray-700'
          } relative`}
        >
          {/* Sender name for messages not from current user */}
          {!isFromCurrentUser && (
            <div className="font-semibold text-sm mb-1 text-gray-700 dark:text-gray-300">
              {message.sender}
            </div>
          )}
          
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
          
          {/* Action buttons positioned correctly */}
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
        </div>
      </div>
      
      {/* Reaction shown if selected */}
      {reaction && (
        <div className={`absolute ${isFromCurrentUser ? '-bottom-2 right-2' : '-bottom-2 left-2'}`}>
          <span className="text-lg bg-white dark:bg-gray-800 rounded-full px-1 py-0.5 shadow-sm">{reaction}</span>
        </div>
      )}
      
      {/* Reply input */}
      {isReplying && (
        <div className={`mt-2 mb-4 ${isFromCurrentUser ? 'ml-10' : 'mr-10'}`}>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
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
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmUnsend}
        onCancel={() => setIsDeleteDialogOpen(false)}
        title="Unsend Message"
        description="Are you sure you want to unsend this message? It will be deleted for everyone."
      />
    </div>
  );
};

export default MessageItem;
