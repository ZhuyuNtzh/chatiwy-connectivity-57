import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import { supabaseService } from '@/services/supabaseService';
import { useChat } from '@/hooks/useChat';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatActions from '@/components/chat/ChatActions';
import UserModals from '@/components/chat/UserModals';
import VipFeatures from '@/components/chat/VipFeatures';
import ChatWindowContainer from '@/components/chat/ChatWindowContainer';
import ChatInputHandlers from '@/components/chat/ChatInputHandlers';
import ChatConnectionHandler from '@/components/chat/ChatConnectionHandler';

// Flag to use Supabase instead of SignalR
const USE_SUPABASE = true;

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
  isAdminView?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  user, 
  countryFlags, 
  onClose, 
  isAdminView = false 
}) => {
  const { userRole, currentUser } = useUser();
  
  // Use correct service based on flag
  const service = USE_SUPABASE ? supabaseService : signalRService;
  
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
    unsendMessage,
    isDeletionInProgress
  } = useChat(user.id, userRole);
  
  return (
    <ChatConnectionHandler
      userId={user.id}
      username={user.username}
      service={service}
    >
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
            onToggleTranslation={userRole === 'vip' || isAdminView ? toggleTranslation : undefined}
            isTranslationEnabled={isTranslationEnabled}
            onSelectLanguage={userRole === 'vip' || isAdminView ? setSelectedLanguage : undefined}
            selectedLanguage={selectedLanguage}
            onShowMediaGallery={userRole === 'vip' || isAdminView ? showMediaGallery : undefined}
            onDeleteConversation={userRole === 'vip' || isAdminView ? deleteConversation : undefined}
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
          isUserBlocked={service.isUserBlocked(user.id)}
          isVipUser={userRole === 'vip'}
          fileInputRef={fileInputRef}
          handleVoiceMessageClick={userRole === 'vip' || isAdminView ? handleVoiceMessageClick : undefined}
          sendVoiceMessage={userRole === 'vip' || isAdminView ? sendVoiceMessage : undefined}
          isAdminView={isAdminView}
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
        />
        
        {(userRole === 'vip' || isAdminView) && (
          <VipFeatures
            isMediaGalleryOpen={isMediaGalleryOpen}
            setIsMediaGalleryOpen={setIsMediaGalleryOpen}
            mediaGalleryItems={mediaGalleryItems}
            user={user}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            onConfirmDelete={confirmDeleteConversation}
            onCancelDelete={cancelDeleteConversation}
            isDeletionInProgress={isDeletionInProgress}
          />
        )}
      </ChatWindowContainer>
    </ChatConnectionHandler>
  );
};

export default ChatWindow;
