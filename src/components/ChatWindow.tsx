
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import { useChat } from '@/hooks/useChat';
import { useUserManagement } from '@/hooks/useUserManagement';
import { toast } from 'sonner';

// Import refactored components
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatActions from '@/components/chat/ChatActions';
import UserModals from '@/components/chat/UserModals';
import VipFeatures from '@/components/chat/VipFeatures';
import ChatWindowContainer from '@/components/chat/ChatWindowContainer';
import ChatInputHandlers from '@/components/chat/ChatInputHandlers';

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
  isAdmin?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, countryFlags, onClose, isAdmin = false }) => {
  const { userRole } = useUser();
  const { kickUser } = useUserManagement();
  
  // Admins are treated as VIP users for chat purposes
  const effectiveRole = isAdmin ? 'vip' : userRole;
  
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
    updateScrollPosition,
    isTyping,
    isTranslationEnabled,
    selectedLanguage,
    setSelectedLanguage,
    isMediaGalleryOpen,
    setIsMediaGalleryOpen,
    mediaGalleryItems,
    isRecording,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isKickDialogOpen,
    setIsKickDialogOpen,
    isBanDialogOpen,
    setIsBanDialogOpen,
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
    handleVoiceMessageClick,
    sendVoiceMessage,
    toggleImageBlur,
    openImagePreview,
    showBlockedUsersList,
    toggleTranslation,
    showMediaGallery,
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation,
    replyToMessage,
    unsendMessage
  } = useChat(user.id, effectiveRole, isAdmin);
  
  // Admin-specific actions
  const handleKickUser = () => {
    if (isAdmin) {
      setIsKickDialogOpen(true);
    }
  };
  
  const confirmKickUser = () => {
    kickUser(user.id);
    toast.success(`${user.username} has been kicked from the chat`);
    setIsKickDialogOpen(false);
    onClose(); // Close the chat window after kicking
  };
  
  const handleBanUser = () => {
    if (isAdmin) {
      setIsBanDialogOpen(true);
    }
  };
  
  const confirmBanUser = () => {
    // In a real app, this would call an API to ban the user
    console.log(`User ${user.username} has been banned`);
    toast.success(`${user.username} has been banned`);
    setIsBanDialogOpen(false);
    onClose(); // Close the chat window after banning
  };
  
  return (
    <ChatWindowContainer>
      <div className="sticky top-0 z-[60] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <ChatHeader 
          user={user}
          countryFlags={countryFlags}
          onClose={onClose}
          showOptions={showOptions}
          onShowOptions={setShowOptions}
          onBlockUser={handleBlockUser}
          onReportUser={handleReportUser}
          onShowBlockedUsers={showBlockedUsersList}
          onToggleTranslation={toggleTranslation}
          isTranslationEnabled={isTranslationEnabled}
          onSelectLanguage={setSelectedLanguage}
          selectedLanguage={selectedLanguage}
          onShowMediaGallery={showMediaGallery}
          onDeleteConversation={deleteConversation}
          onKickUser={isAdmin ? handleKickUser : undefined}
          onBanUser={isAdmin ? handleBanUser : undefined}
          isAdmin={isAdmin}
        />
      </div>
      
      <ChatMessages 
        messages={messages}
        toggleImageBlur={toggleImageBlur}
        openImagePreview={openImagePreview}
        autoScrollToBottom={autoScrollToBottom}
        updateScrollPosition={updateScrollPosition}
        isTyping={isTyping}
        selectedUserId={user.id}
        onReplyToMessage={replyToMessage}
        onUnsendMessage={unsendMessage}
      />
      
      <ChatActions 
        message={message}
        setMessage={setMessage}
        maxChars={isAdmin ? 999999 : maxChars} // Unlimited for admin
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        handleAddEmoji={handleAddEmoji}
        handleImageClick={handleImageClick}
        isUserBlocked={false} // Admin can never be blocked
        isVipUser={true} // Admin has all VIP features
        fileInputRef={fileInputRef}
        handleVoiceMessageClick={handleVoiceMessageClick}
        sendVoiceMessage={sendVoiceMessage}
        isAdmin={isAdmin}
      />
      
      <ChatInputHandlers
        fileInputRef={fileInputRef}
        handleImageChange={handleImageChange}
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
        isKickDialogOpen={isKickDialogOpen}
        setIsKickDialogOpen={setIsKickDialogOpen}
        confirmKickUser={confirmKickUser}
        isBanDialogOpen={isBanDialogOpen}
        setIsBanDialogOpen={setIsBanDialogOpen}
        confirmBanUser={confirmBanUser}
      />
      
      {/* VIP Features (Admin has all VIP features) */}
      <VipFeatures
        isMediaGalleryOpen={isMediaGalleryOpen}
        setIsMediaGalleryOpen={setIsMediaGalleryOpen}
        mediaGalleryItems={mediaGalleryItems}
        user={user}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDeleteConversation}
        onCancelDelete={cancelDeleteConversation}
      />
    </ChatWindowContainer>
  );
};

export default ChatWindow;
