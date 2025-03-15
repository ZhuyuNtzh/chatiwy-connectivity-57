
import React, { useState } from 'react';
import { ChatMessage } from '@/services/signalR/types';
import { useUser } from '@/contexts/UserContext';
import MessageContent from './message/MessageContent';
import MessageActions from './message/MessageActions';
import MessageHeader from './message/MessageHeader';
import MessageFooter from './message/MessageFooter';
import MessageReplySection from './message/MessageReplySection';
import ReactionDisplay from './message/ReactionDisplay';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface MessageItemProps {
  message: ChatMessage;
  toggleImageBlur: (messageId: string) => void;
  openImagePreview: (imageUrl: string) => void;
  showMessageStatus?: boolean;
  onReply?: (messageId: string, messageText: string) => void;
  onUnsendMessage?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  toggleImageBlur, 
  openImagePreview,
  showMessageStatus = false,
  onReply,
  onUnsendMessage
}) => {
  const { userRole, currentUser } = useUser();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Check if message is from current user
  const isFromCurrentUser = message.sender === currentUser?.username || message.sender === 'You';
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
  
  return (
    <div className="relative group mb-4">
      {/* Reply reference */}
      {message.replyToId && (
        <MessageReplySection 
          replyToId={message.replyToId} 
          replyText={message.replyText} 
          isFromCurrentUser={isFromCurrentUser}
        />
      )}
      
      {/* Message */}
      <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`max-w-[80%] rounded-lg p-3 ${
            isFromCurrentUser 
              ? 'bg-primary text-white dark:bg-primary' 
              : 'bg-gray-100 dark:bg-gray-700'
          } relative`}
        >
          {/* Sender name for messages not from current user */}
          {!isFromCurrentUser && (
            <MessageHeader sender={message.actualUsername || message.sender} />
          )}
          
          <MessageContent 
            message={message} 
            toggleImageBlur={toggleImageBlur} 
            openImagePreview={openImagePreview} 
          />
          
          <MessageFooter 
            timestamp={message.timestamp}
            showMessageStatus={showMessageStatus && isFromCurrentUser}
          />
          
          {/* Action buttons */}
          <MessageActions 
            isFromCurrentUser={isFromCurrentUser}
            showReactionPicker={showReactionPicker}
            setShowReactionPicker={setShowReactionPicker}
            handleReaction={handleReaction}
            handleStartReply={handleStartReply}
            isVip={isVip}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          />
        </div>
      </div>
      
      {/* Reaction display */}
      {reaction && (
        <ReactionDisplay 
          reaction={reaction} 
          isFromCurrentUser={isFromCurrentUser} 
        />
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
            <button 
              onClick={handleCancelReply}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="p-1 px-2 bg-primary text-white rounded disabled:opacity-50"
            >
              Reply
            </button>
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
