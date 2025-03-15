
import { useState, useEffect, useRef } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { useMessages } from './useMessages';
import { useMediaHandling } from './useMediaHandling';
import { useUserInteractions } from './useUserInteractions';
import { useMessageTranslation } from './useMessageTranslation';
import { useMediaGallery } from './useMediaGallery';
import { useConversationManagement } from './useConversationManagement';
import { useVipMessageFeatures } from './useVipMessageFeatures';
import { useScrollManagement } from './useScrollManagement';
import { toast } from "sonner";

export const useChat = (userId: number, userRole: string) => {
  // Use custom hooks to organize logic
  const {
    messages,
    setMessages,
    message,
    setMessage,
    maxChars,
    handleSendMessage,
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
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation
  } = useConversationManagement();

  const {
    replyToMessage: baseReplyToMessage,
    unsendMessage: baseUnsendMessage
  } = useVipMessageFeatures(userRole);

  const {
    autoScrollToBottom,
    setAutoScrollToBottom,
    isAtBottomRef,
    updateScrollPosition
  } = useScrollManagement();

  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle real-time messaging with SignalR
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      // Only process messages specific to this conversation
      if (msg.senderId === userId || msg.recipientId === userId) {
        // Apply real-time translation if enabled (for VIP users)
        if (isTranslationEnabled && userRole === 'vip' && msg.senderId === userId && selectedLanguage !== 'en') {
          translateMessage(msg).then(translatedMsg => {
            setMessages(prev => [...prev, translatedMsg]);
          });
        } else {
          setMessages(prev => [...prev, msg]);
        }
        
        // Update media gallery if it's media
        if (msg.isImage || msg.isVoiceMessage || (msg.content && isLinkMessage(msg.content))) {
          setMediaGalleryItems(prev => [
            ...prev, 
            {
              type: msg.isImage ? 'image' : msg.isVoiceMessage ? 'voice' : 'link',
              url: msg.isImage ? (msg.imageUrl || '') : msg.isVoiceMessage ? (msg.audioUrl || '') : extractLink(msg.content || ''),
              timestamp: new Date(msg.timestamp)
            }
          ]);
        }
        
        // Only auto-scroll if user was already at the bottom
        if (isAtBottomRef.current) {
          setAutoScrollToBottom(true);
          
          // Reset auto-scroll after a short delay
          setTimeout(() => {
            setAutoScrollToBottom(false);
          }, 300);
        }
      }
    };
    
    // Simulate user typing indication (for VIP)
    const handleUserTyping = (typingUserId: number) => {
      if (typingUserId === userId && userRole === 'vip') {
        setIsTyping(true);
        
        // Clear existing timer
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        
        // Set a timer to turn off typing indicator after 3 seconds
        typingTimerRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };
    
    // Handle message deletion
    const handleMessageDeleted = (messageId: string) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: true } 
            : msg
        )
      );
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    signalRService.onUserTyping(handleUserTyping);
    signalRService.onMessageDeleted(handleMessageDeleted);
    
    // Load existing messages specifically for this user
    const existingMessages = signalRService.getChatHistory(userId);
    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages);
      
      // Load media for the gallery
      const mediaItems = existingMessages.filter(msg => 
        msg.isImage || msg.isVoiceMessage || (msg.content && isLinkMessage(msg.content))
      ).map(msg => ({
        type: msg.isImage ? 'image' as const : msg.isVoiceMessage ? 'voice' as const : 'link' as const,
        url: msg.isImage ? (msg.imageUrl || '') : msg.isVoiceMessage ? (msg.audioUrl || '') : extractLink(msg.content || ''),
        timestamp: new Date(msg.timestamp)
      }));
      
      setMediaGalleryItems(mediaItems);
    }
    
    // Check if this user is already blocked
    if (signalRService.isUserBlocked(userId)) {
      setBlockedUsers(prev => [...prev, userId]);
    }
    
    return () => {
      // Cleanup
      signalRService.offMessageReceived(handleNewMessage);
      signalRService.offUserTyping(handleUserTyping);
      signalRService.offMessageDeleted(handleMessageDeleted);
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [userId, userRole, isTranslationEnabled, selectedLanguage, setBlockedUsers, setMessages]);

  // Helper UI functions
  const toggleImageBlur = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isBlurred: !msg.isBlurred } : msg
    ));
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
  
  // Wrapper for confirmDeleteConversation that provides the right dependencies
  const handleConfirmDeleteConversation = () => {
    confirmDeleteConversation(setMessages, setMediaGalleryItems);
  };

  // Wrapper for replyToMessage that provides the right dependencies
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

  // Wrapper for unsendMessage that provides the right dependencies
  const handleUnsendMessage = (messageId: string) => {
    baseUnsendMessage(messageId, userId, setMessages);
  };

  return {
    // State
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
    
    // Functions
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
