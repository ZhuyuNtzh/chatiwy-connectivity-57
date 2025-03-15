
import { useState } from 'react';
import { signalRService } from '@/services/signalRService';
import { useMessages } from './useMessages';
import { useMediaHandling } from './useMediaHandling';
import { useUserInteractions } from './useUserInteractions';
import { useMessageTranslation } from './useMessageTranslation';
import { useMediaGallery } from './useMediaGallery';
import { useConversationManagement } from './useConversationManagement';
import { useVipMessageFeatures } from './useVipMessageFeatures';
import { useScrollManagement } from './useScrollManagement';
import { useChatMessages } from './useChatMessages';
import { useChatTyping } from './useChatTyping';

export const useChat = (userId: number, userRole: string) => {
  // Basic message input state
  const {
    message,
    setMessage,
    maxChars,
    handleSendMessage,
    handleKeyDown,
    handleAddEmoji
  } = useMessages(userId, userRole);

  // Translation features
  const {
    isTranslationEnabled,
    selectedLanguage,
    setSelectedLanguage,
    translateMessage,
    toggleTranslation
  } = useMessageTranslation(userRole);

  // Message loading and management
  const {
    messages,
    setMessages,
    toggleImageBlur
  } = useChatMessages(userId, userRole, isTranslationEnabled, selectedLanguage);

  // Media handling
  const {
    isImageDialogOpen,
    setIsImageDialogOpen,
    imagePreview,
    isRecording,
    audioPreview,
    previewImage,
    setPreviewImage,
    fileInputRef,
    handleImageClick,
    handleImageChange,
    handleSendImage,
    handleVoiceMessageClick,
    sendVoiceMessage
  } = useMediaHandling(userId);

  // User interaction features
  const {
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
    blockedUsers,
    setBlockedUsers,
    isBlockedUsersDialogOpen,
    setIsBlockedUsersDialogOpen,
    handleBlockUser,
    confirmBlockUser,
    handleUnblockUser,
    handleReportUser,
    handleSubmitReport
  } = useUserInteractions(userId);

  // Media gallery
  const {
    isMediaGalleryOpen,
    setIsMediaGalleryOpen,
    mediaGalleryItems,
    setMediaGalleryItems,
    showMediaGallery,
    isLinkMessage,
    extractLink
  } = useMediaGallery();

  // Conversation management
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation
  } = useConversationManagement();

  // VIP message features
  const {
    replyToMessage: baseReplyToMessage,
    unsendMessage: baseUnsendMessage
  } = useVipMessageFeatures(userRole);

  // Scroll management
  const {
    autoScrollToBottom,
    setAutoScrollToBottom,
    isAtBottomRef,
    updateScrollPosition
  } = useScrollManagement();

  // Typing indicator
  const { isTyping } = useChatTyping(userId, userRole);

  // Process received messages for media gallery
  useEffect(() => {
    // Extract media items from filtered messages
    const extractMediaItems = () => {
      const filteredMessages = messages.filter(msg => 
        (msg.senderId === userId && msg.recipientId === signalRService.currentUserId) ||
        (msg.senderId === signalRService.currentUserId && msg.recipientId === userId)
      );
      
      const mediaItems = filteredMessages.filter(msg => 
        msg.isImage || msg.isVoiceMessage || (msg.content && isLinkMessage(msg.content))
      ).map(msg => ({
        type: msg.isImage ? 'image' as const : msg.isVoiceMessage ? 'voice' as const : 'link' as const,
        url: msg.isImage ? (msg.imageUrl || '') : msg.isVoiceMessage ? (msg.audioUrl || '') : extractLink(msg.content || ''),
        timestamp: new Date(msg.timestamp)
      }));
      
      setMediaGalleryItems(mediaItems);
    };
    
    extractMediaItems();
  }, [messages, userId, isLinkMessage, extractLink, setMediaGalleryItems]);

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const showBlockedUsersList = () => {
    const blockedIds = signalRService.getBlockedUsers();
    setBlockedUsers(blockedIds);
    setIsBlockedUsersDialogOpen(true);
    setShowOptions(false);
  };
  
  const handleConfirmDeleteConversation = () => {
    confirmDeleteConversation(setMessages, setMediaGalleryItems);
  };

  const handleReplyToMessage = (messageId: string, messageText: string) => {
    baseReplyToMessage(
      messageId, 
      messageText, 
      message, 
      setMessage, 
      setMessages, 
      userId, 
      setAutoScrollToBottom
    );
  };

  const handleUnsendMessage = (messageId: string) => {
    baseUnsendMessage(messageId, userId, setMessages);
  };

  return {
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
    isTyping,
    isTranslationEnabled,
    selectedLanguage,
    setSelectedLanguage,
    isMediaGalleryOpen,
    setIsMediaGalleryOpen,
    mediaGalleryItems,
    isRecording,
    audioPreview,
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
    confirmDeleteConversation: handleConfirmDeleteConversation,
    cancelDeleteConversation,
    replyToMessage: handleReplyToMessage,
    unsendMessage: handleUnsendMessage,
    updateScrollPosition
  };
};
