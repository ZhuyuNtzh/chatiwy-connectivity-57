
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import { useChat } from '../hooks/useChat';

// Import refactored components
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatActions from './chat/ChatActions';
import UserModals from './chat/UserModals';

interface ChatWindowProps {
  user: {
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  };
  countryFlags: Record<string, string>;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, countryFlags, onClose }) => {
  const { userRole } = useUser();
  const {
    message,
    setMessage,
    messages,
    showOptions,
    setShowOptions,
    isBlockDialogOpen,
    setIsBlockDialogOpen,
    isReportDialogOpen,
    setIsReportDialogOpen,
    selectedReportReason,
    setSelectedReportReason,
    otherReportReason,
    setOtherReportReason,
    isImageDialogOpen,
    setIsImageDialogOpen,
    imagePreview,
    blockedUsers,
    isBlockedUsersDialogOpen,
    setIsBlockedUsersDialogOpen,
    previewImage,
    setPreviewImage,
    fileInputRef,
    maxChars,
    autoScrollToBottom,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji,
    handleBlockUser,
    confirmBlockUser,
    handleUnblockUser,
    handleReportUser,
    handleSubmitReport,
    handleImageClick,
    handleImageChange,
    handleSendImage,
    toggleImageBlur,
    openImagePreview,
    showBlockedUsersList
  } = useChat(user.id, userRole);
  
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 h-full w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <ChatHeader 
        user={user}
        countryFlags={countryFlags}
        onClose={onClose}
        showOptions={showOptions}
        onShowOptions={setShowOptions}
        onBlockUser={handleBlockUser}
        onReportUser={handleReportUser}
        onShowBlockedUsers={showBlockedUsersList}
      />
      
      <ChatMessages 
        messages={messages}
        toggleImageBlur={toggleImageBlur}
        openImagePreview={openImagePreview}
        autoScrollToBottom={autoScrollToBottom}
      />
      
      <ChatActions 
        message={message}
        setMessage={setMessage}
        maxChars={maxChars}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        handleAddEmoji={handleAddEmoji}
        handleImageClick={handleImageClick}
        isUserBlocked={signalRService.isUserBlocked(user.id)}
        isVipUser={userRole === 'vip'}
        fileInputRef={fileInputRef}
      />
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
      
      <UserModals 
        user={user}
        isBlockDialogOpen={isBlockDialogOpen}
        setIsBlockDialogOpen={setIsBlockDialogOpen}
        confirmBlockUser={confirmBlockUser}
        isReportDialogOpen={isReportDialogOpen}
        setIsReportDialogOpen={setIsReportDialogOpen}
        selectedReportReason={selectedReportReason}
        setSelectedReportReason={setSelectedReportReason}
        otherReportReason={otherReportReason}
        setOtherReportReason={setOtherReportReason}
        handleSubmitReport={handleSubmitReport}
        isImageDialogOpen={isImageDialogOpen}
        setIsImageDialogOpen={setIsImageDialogOpen}
        imagePreview={imagePreview}
        handleSendImage={handleSendImage}
        isBlockedUsersDialogOpen={isBlockedUsersDialogOpen}
        setIsBlockedUsersDialogOpen={setIsBlockedUsersDialogOpen}
        blockedUsers={blockedUsers}
        handleUnblockUser={handleUnblockUser}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />
    </div>
  );
};

export default ChatWindow;
