
import React from 'react';
import MessageInput from './MessageInput';
import { useUser } from '@/contexts/UserContext';

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
  isAdminView?: boolean;
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
  sendVoiceMessage,
  isAdminView = false
}) => {
  const { userRole } = useUser();
  const isAdmin = userRole === 'admin' || isAdminView;
  
  // Admin users have unlimited characters and all features
  const effectiveMaxChars = isAdmin ? Number.MAX_SAFE_INTEGER : maxChars;
  const effectiveIsVip = isAdmin ? true : isVipUser;
  
  return (
    <MessageInput 
      message={message}
      setMessage={setMessage}
      maxChars={effectiveMaxChars}
      handleSendMessage={handleSendMessage}
      handleKeyDown={handleKeyDown}
      handleAddEmoji={handleAddEmoji}
      handleImageClick={handleImageClick}
      isUserBlocked={isUserBlocked}
      isVipUser={effectiveIsVip}
      fileInputRef={fileInputRef}
      handleVoiceMessageClick={handleVoiceMessageClick}
      sendVoiceMessage={sendVoiceMessage}
      isAdminView={isAdmin}
    />
  );
};

export default ChatActions;
