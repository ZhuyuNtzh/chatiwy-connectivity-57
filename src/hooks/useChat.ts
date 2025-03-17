import { useState, useEffect, useRef } from 'react';
import { signalRService } from '@/services/signalRService';
import { ChatMessageService } from '@/services/ChatMessageService';
import type { ChatMessage } from '@/services/signalR/types';
import { useMessages } from './useMessages';
import { useMediaHandling } from './useMediaHandling';
import { useUserInteractions } from './useUserInteractions';
import { useMessageTranslation } from './useMessageTranslation';
import { useMediaGallery } from './useMediaGallery';
import { useConversationManagement } from './useConversationManagement';
import { useVipMessageFeatures } from './useVipMessageFeatures';
import { useScrollManagement } from './useScrollManagement';
import { useUser } from '@/contexts/UserContext';

export const useChat = (userId: number, userRole: string) => {
  // Set the selected user ID in signalRService when it changes
  useEffect(() => {
    signalRService.selectedUserId = userId;
  }, [userId]);

  // Get current user info
  const { currentUser } = useUser();
  
  // Use custom hooks to organize logic
  const {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars,
    handleSendMessage: baseHandleSendMessage,
    handleKeyDown,
    handleAddEmoji
  } = useMessages(userId, userRole);

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

  const {
    isTranslationEnabled,
    selectedLanguage,
    setSelectedLanguage,
    translateMessage,
    toggleTranslation
  } = useMessageTranslation(userRole);

  const {
    isMediaGalleryOpen,
    setIsMediaGalleryOpen,
    mediaGalleryItems,
    setMediaGalleryItems,
    showMediaGallery,
    isLinkMessage,
    extractLink
  } = useMediaGallery();

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeletingConversation,
    deleteConversation,
    confirmDeleteConversation: baseConfirmDeleteConversation,
    cancelDeleteConversation
  } = useConversationManagement();

  const {
    replyingTo,
    replyToMessage: baseReplyToMessage,
    sendReplyMessage,
    unsendMessage: baseUnsendMessage,
    clearReply
  } = useVipMessageFeatures(userRole);

  const {
    autoScrollToBottom,
    setAutoScrollToBottom,
    isAtBottomRef,
    updateScrollPosition
  } = useScrollManagement();

  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousUserIdRef = useRef<number | null>(null);

  // Load chat history when user changes
  useEffect(() => {
    // Clear messages when switching users
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== userId) {
      console.log(`Switching from user ${previousUserIdRef.current} to ${userId}, clearing messages`);
      setMessages([]);
    }
    
    previousUserIdRef.current = userId;
    
    // Load messages for this user
    ChatMessageService.loadMessages(
      userId,
      isTranslationEnabled,
      userRole,
      selectedLanguage,
      translateMessage,
      setMessages,
      setMediaGalleryItems,
      isLinkMessage,
      extractLink
    );
    
    if (signalRService.isUserBlocked(userId)) {
      setBlockedUsers(prev => [...prev, userId]);
    }
  }, [userId, userRole, isTranslationEnabled, selectedLanguage]);

  // Set up message event handlers
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      ChatMessageService.processNewMessage(
        msg,
        userId,
        isTranslationEnabled,
        userRole,
        selectedLanguage,
        translateMessage,
        setMessages,
        setMediaGalleryItems,
        isLinkMessage,
        extractLink,
        isAtBottomRef.current,
        setAutoScrollToBottom
      );
    };
    
    const handleUserTyping = (typingUserId: number) => {
      if (typingUserId === userId && userRole === 'vip') {
        setIsTyping(true);
        
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        
        typingTimerRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };
    
    const handleMessageDeleted = (messageId: string) => {
      ChatMessageService.markAsDeleted(messageId, setMessages);
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    signalRService.onUserTyping(handleUserTyping);
    signalRService.onMessageDeleted(handleMessageDeleted);
    
    return () => {
      signalRService.offMessageReceived(handleNewMessage);
      signalRService.offUserTyping(handleUserTyping);
      signalRService.offMessageDeleted(handleMessageDeleted);
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [userId, userRole, isTranslationEnabled, selectedLanguage]);

  // Custom message sending handler to properly handle replies
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(userId)) {
      return;
    }
    
    // Check if we're replying to a message
    if (replyingTo && userRole === 'vip') {
      const success = sendReplyMessage(message.trim(), userId, setMessages);
      if (success) {
        setMessage('');
        return;
      }
    }
    
    // Regular message sending
    const username = currentUser?.username || 'You';
    ChatMessageService.sendMessage(userId, message.trim(), username, setMessages);
    
    // Clear input field and any reply state
    setMessage('');
    if (replyingTo) {
      clearReply(setMessages);
    }
  };
  
  const toggleImageBlur = (messageId: string) => {
    ChatMessageService.toggleImageBlur(messageId, setMessages);
  };
  
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
    // Always make sure we pass the state setters to the base function
    baseConfirmDeleteConversation(setMessages, setMediaGalleryItems);
  };

  const handleReplyToMessage = (messageId: string, messageText: string) => {
    if (userRole !== 'vip') return;
    
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
    if (userRole !== 'vip') return;
    
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
    updateScrollPosition,
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
    isDeletingConversation,
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
    unsendMessage: handleUnsendMessage
  };
};
