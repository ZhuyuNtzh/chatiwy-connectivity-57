
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import { useChat } from '@/hooks/useChat';

// Import refactored components
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatActions from '@/components/chat/ChatActions';
import UserModals from '@/components/chat/UserModals';
import MediaGalleryDialog from '@/components/chat/MediaGalleryDialog';
import DeleteConfirmationDialog from '@/components/chat/DeleteConfirmationDialog';

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
  } = useChat(user.id, userRole);
  
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 h-full w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
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
          onToggleTranslation={userRole === 'vip' ? toggleTranslation : undefined}
          isTranslationEnabled={isTranslationEnabled}
          onSelectLanguage={userRole === 'vip' ? setSelectedLanguage : undefined}
          selectedLanguage={selectedLanguage}
          onShowMediaGallery={userRole === 'vip' ? showMediaGallery : undefined}
          onDeleteConversation={userRole === 'vip' ? deleteConversation : undefined}
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
        maxChars={maxChars}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        handleAddEmoji={handleAddEmoji}
        handleImageClick={handleImageClick}
        isUserBlocked={signalRService.isUserBlocked(user.id)}
        isVipUser={userRole === 'vip'}
        fileInputRef={fileInputRef}
        handleVoiceMessageClick={userRole === 'vip' ? handleVoiceMessageClick : undefined}
        sendVoiceMessage={userRole === 'vip' ? sendVoiceMessage : undefined}
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
      
      {/* Media Gallery Dialog for VIP users */}
      {userRole === 'vip' && (
        <MediaGalleryDialog
          isOpen={isMediaGalleryOpen}
          onOpenChange={setIsMediaGalleryOpen}
          mediaItems={mediaGalleryItems}
          user={user}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {userRole === 'vip' && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteConversation}
          onCancel={cancelDeleteConversation}
        />
      )}
    </div>
  );
};

export default ChatWindow;
