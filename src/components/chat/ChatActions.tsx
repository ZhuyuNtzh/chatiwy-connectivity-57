
import React from 'react';
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
  handleVoiceMessageClick?: () => void;
  sendVoiceMessage?: (audioUrl: string) => void;
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
  fileInputRef,
  handleVoiceMessageClick,
  sendVoiceMessage
}) => {
  return (
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
      handleVoiceMessageClick={handleVoiceMessageClick}
      sendVoiceMessage={sendVoiceMessage}
    />
  );
};

export default ChatActions;
