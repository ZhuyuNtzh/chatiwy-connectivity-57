
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
  const previousUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear messages when switching users
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== userId) {
      console.log(`Switching from user ${previousUserIdRef.current} to ${userId}, clearing messages`);
      setMessages([]);
    }
    
    previousUserIdRef.current = userId;

    const handleNewMessage = (msg: ChatMessage) => {
      // Only show messages that belong to the current conversation
      const isFromSelectedUser = msg.senderId === userId && msg.recipientId === signalRService.currentUserId;
      const isToSelectedUser = msg.senderId === signalRService.currentUserId && msg.recipientId === userId;
      
      if (isFromSelectedUser || isToSelectedUser) {
        console.log(`Message belongs to conversation with user ${userId}:`, msg);
        
        if (isTranslationEnabled && userRole === 'vip' && msg.senderId === userId && selectedLanguage !== 'en') {
          translateMessage(msg).then(translatedMsg => {
            setMessages(prev => [...prev, translatedMsg]);
          });
        } else {
          setMessages(prev => [...prev, msg]);
        }
        
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
        
        if (isAtBottomRef.current) {
          setAutoScrollToBottom(true);
          
          setTimeout(() => {
            setAutoScrollToBottom(false);
          }, 300);
        }
      } else {
        console.log(`Message not for conversation with user ${userId}:`, msg);
      }
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
    
    console.log(`Loading chat history for user ${userId}`);
    const existingMessages = signalRService.getChatHistory(userId);
    if (existingMessages && existingMessages.length > 0) {
      console.log(`Found ${existingMessages.length} messages for user ${userId}`);
      
      // Filter messages to only include ones relevant to this conversation
      const filteredMessages = existingMessages.filter(msg => 
        (msg.senderId === userId && msg.recipientId === signalRService.currentUserId) ||
        (msg.senderId === signalRService.currentUserId && msg.recipientId === userId)
      );
      
      setMessages(filteredMessages);
      
      const mediaItems = filteredMessages.filter(msg => 
        msg.isImage || msg.isVoiceMessage || (msg.content && isLinkMessage(msg.content))
      ).map(msg => ({
        type: msg.isImage ? 'image' as const : msg.isVoiceMessage ? 'voice' as const : 'link' as const,
        url: msg.isImage ? (msg.imageUrl || '') : msg.isVoiceMessage ? (msg.audioUrl || '') : extractLink(msg.content || ''),
        timestamp: new Date(msg.timestamp)
      }));
      
      setMediaGalleryItems(mediaItems);
    } else {
      console.log(`No existing messages found for user ${userId}`);
      setMessages([]);
      setMediaGalleryItems([]);
    }
    
    if (signalRService.isUserBlocked(userId)) {
      setBlockedUsers(prev => [...prev, userId]);
    }
    
    return () => {
      signalRService.offMessageReceived(handleNewMessage);
      signalRService.offUserTyping(handleUserTyping);
      signalRService.offMessageDeleted(handleMessageDeleted);
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [userId, userRole, isTranslationEnabled, selectedLanguage, setBlockedUsers, setMessages, setMediaGalleryItems]);

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
