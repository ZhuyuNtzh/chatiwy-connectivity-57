
import React, { useRef } from 'react';
import MessageInput from './MessageInput';

interface ChatActionsProps {
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

const ChatActions: React.FC<ChatActionsProps> = ({
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
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <MessageInput 
        message={message}
        setMessage={setMessage}
        maxChars={maxChars}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        handleAddEmoji={handleAddEmoji}
        handleImageClick={handleImageClick}
        isUserBlocked={isUserBlocked}
        isVipUser={isVipUser}
        fileInputRef={fileInputRef}
      />
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={() => {}} // This will be handled by the parent component
      />
    </div>
  );
};

export default ChatActions;
