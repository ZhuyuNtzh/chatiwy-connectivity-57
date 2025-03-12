import { useState, useEffect, useRef } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';
import { useMessages } from './useMessages';
import { useMediaHandling } from './useMediaHandling';
import { useUserInteractions } from './useUserInteractions';
import { toast } from "sonner";

export const useChat = (userId: number, userRole: string) => {
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
    fileInputRef,
    handleImageClick,
    handleImageChange,
    handleSendImage,
    handleVoiceMessageClick
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
    isBlockedUsersDialogOpen,
    setIsBlockedUsersDialogOpen,
    handleBlockUser,
    confirmBlockUser,
    handleUnblockUser,
    handleReportUser,
    handleSubmitReport
  } = useUserInteractions(userId);

  const [isTyping, setIsTyping] = useState(false);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaGalleryItems, setMediaGalleryItems] = useState<{
    type: 'image' | 'voice' | 'link';
    url: string;
    timestamp: Date;
  }[]>([]);
  
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(false);
  const isAtBottomRef = useRef(true);
  
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      // Only process messages specific to this conversation
      // Message is either:
      // 1. From this user (senderId === userId) to current user
      // 2. From current user to this user (recipientId === userId)
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
          }, 300); // Increase the delay to ensure scrolling completes
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
      // setBlockedUsers(prev => [...prev, userId]); // This line was moved to useUserInteractions
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
  }, [userId, userRole, isTranslationEnabled, selectedLanguage]);
  
  // Helper function to simulate message translation
  const translateMessage = async (msg: ChatMessage): Promise<ChatMessage> => {
    try {
      // In a real app, you would call a translation API here
      // For demo, we'll simulate a translation
      const translatedContent = msg.content ? `[Translated: ${msg.content}]` : msg.content;
      
      return {
        ...msg,
        content: translatedContent,
        translated: true
      } as ChatMessage;
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate message');
      return msg;
    }
  };
  
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
  
  const updateScrollPosition = (isAtBottom: boolean) => {
    isAtBottomRef.current = isAtBottom;
  };
  
  const toggleTranslation = () => {
    if (userRole !== 'vip') {
      toast.error('Translation is a VIP feature');
      return;
    }
    setIsTranslationEnabled(prev => !prev);
    toast.success(isTranslationEnabled ? 'Translation disabled' : 'Translation enabled');
  };
  
  const showMediaGallery = () => {
    setIsMediaGalleryOpen(true);
    setShowOptions(false);
  };
  
  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
    setShowOptions(false);
  };
  
  const confirmDeleteConversation = () => {
    setMessages([]);
    setMediaGalleryItems([]);
    toast.success('Conversation deleted');
    setIsDeleteDialogOpen(false);
  };
  
  const cancelDeleteConversation = () => {
    setIsDeleteDialogOpen(false);
  };
  
  const replyToMessage = (messageId: string, messageText: string) => {
    if (userRole !== 'vip') {
      toast.error('Replying to messages is a VIP feature');
      return;
    }
    
    // Find the message we're replying to
    const replyMessage = messages.find(msg => msg.id === messageId);
    if (!replyMessage) return;
    
    // Create a truncated version of the original message for the reply reference
    const replyText = messageText.length > 50 
      ? messageText.substring(0, 50) + '...' 
      : messageText;
    
    // Send a new message with a reference to the original
    const newMessage: ChatMessage = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: message.trim(),
      sender: 'You',
      senderId: signalRService.currentUserId,
      recipientId: userId,
      timestamp: new Date(),
      replyToId: messageId,
      replyText: replyText
    };
    
    // Add the message to our local messages
    setMessages(prev => [...prev, newMessage]);
    
    // Clear the input field
    setMessage('');
    
    // Auto-scroll to the new message
    setAutoScrollToBottom(true);
    setTimeout(() => setAutoScrollToBottom(false), 300);
  };
  
  const unsendMessage = (messageId: string) => {
    if (userRole !== 'vip') {
      toast.error('Unsending messages is a VIP feature');
      return;
    }
    
    // Find the message we're unsending
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    // Only allow unsending your own messages
    if (message.sender !== 'You') {
      toast.error('You can only unsend your own messages');
      return;
    }
    
    // Send the unsend request to the server
    signalRService.deleteMessage(messageId, userId);
    
    // Update the local state
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true } 
          : msg
      )
    );
    
    toast.success('Message unsent');
  };
  
  // Helper function to check if a message contains a link
  const isLinkMessage = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(content);
  };
  
  // Helper function to extract link from message
  const extractLink = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    return matches ? matches[0] : '';
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
    // functions
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
  };
};
