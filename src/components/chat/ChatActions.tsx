
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
}

const ChatActions: React.FC<ChatActionsProps> = (props) => {
  return (
    <MessageInput {...props} />
  );
};

export default ChatActions;
