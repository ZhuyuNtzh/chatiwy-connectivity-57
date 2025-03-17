
import { useState, useRef, useEffect } from 'react';
import { signalRService } from '@/services/signalRService';
import { ChatMessage } from '@/services/signalR/types';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useUserInteractions } from './useUserInteractions';
import { ChatMessageService } from '@/services/ChatMessageService';

export const useChat = (userId: number, effectiveRole: string, isAdmin = false) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [mediaGalleryItems, setMediaGalleryItems] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { userRole, currentUser } = useUser();
  
  // Admin-specific state
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  
  // Get interactions from hook
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
  
  // Message character limit based on user role (unlimited for admin)
  const maxChars = isAdmin ? 999999 : (effectiveRole === 'vip' ? 200 : 140);
  
  // Load messages on component mount
  useEffect(() => {
    console.log(`Loading chat history for user ${userId}`);
    
    // Load existing messages from service
    ChatMessageService.loadMessages(
      userId,
      isTranslationEnabled,
      effectiveRole,
      selectedLanguage,
      translateMessage,
      setMessages,
      setMediaGalleryItems,
      isLinkMessage,
      extractLink
    );
    
    // Set up listeners for new messages
    const handleNewMessage = (msg: ChatMessage) => {
      ChatMessageService.processNewMessage(
        msg,
        userId,
        isTranslationEnabled,
        effectiveRole,
        selectedLanguage,
        translateMessage,
        setMessages,
        setMediaGalleryItems,
        isLinkMessage,
        extractLink,
        isAtBottom,
        setAutoScrollToBottom
      );
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    
    // Clean up event listener on unmount
    return () => {
      signalRService.offMessageReceived(handleNewMessage);
    };
  }, [userId, isTranslationEnabled, effectiveRole, selectedLanguage]);
  
  // Update scroll position
  const updateScrollPosition = (atBottom: boolean) => {
    setIsAtBottom(atBottom);
  };
  
  // Handle sending messages
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    // Create a message with the correct username from currentUser
    const username = currentUser?.username || 'Admin';
    
    ChatMessageService.sendMessage(
      userId,
      message.trim(),
      username,
      setMessages
    );
    
    // Clear input field
    setMessage('');
  };
  
  // Handle key down events in the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle adding emoji to the message
  const handleAddEmoji = (emoji: string) => {
    if (isAdmin || message.length + emoji.length <= maxChars) {
      setMessage(prev => prev + emoji);
    }
  };
  
  // Handle sending an image
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle image change in the file input
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setIsImageDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle confirming sending the image
  const handleSendImage = () => {
    if (imagePreview) {
      // In a real implementation, you would upload the image to a server here
      // and get a URL. Here we'll just use the data URL for simplicity.
      const username = currentUser?.username || 'Admin';
      const imageUrl = imagePreview;
      
      const newMessage: ChatMessage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        senderId: signalRService.currentUserId,
        recipientId: userId,
        sender: username,
        timestamp: new Date(),
        isImage: true,
        imageUrl,
        isBlurred: true, // Start with blurred image
        isRead: true, // Mark as read since it's our own message
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Call SignalR service to send image message
      signalRService.sendImageMessage(userId, imageUrl);
      
      // Update media gallery
      setMediaGalleryItems(prev => [
        ...prev,
        {
          type: 'image',
          url: imageUrl,
          timestamp: new Date()
        }
      ]);
      
      // Close dialog and clear preview
      setIsImageDialogOpen(false);
      setImagePreview(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle voice messages
  const handleVoiceMessageClick = () => {
    toast.info("Starting voice recording...");
    setIsRecording(true);
  };
  
  const sendVoiceMessage = (audioUrl: string) => {
    // In a real implementation, would upload the audio and get a URL
    const username = currentUser?.username || 'Admin';
    
    const newMessage: ChatMessage = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      senderId: signalRService.currentUserId,
      recipientId: userId,
      sender: username,
      timestamp: new Date(),
      isVoiceMessage: true,
      audioUrl,
      isRead: true, // Mark as read since it's our own message
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Call SignalR service to send voice message
    signalRService.sendVoiceMessage(userId, audioUrl);
    
    // Update media gallery
    setMediaGalleryItems(prev => [
      ...prev,
      {
        type: 'voice',
        url: audioUrl,
        timestamp: new Date()
      }
    ]);
    
    setIsRecording(false);
    toast.success("Voice message sent!");
  };
  
  // Toggle blur on images
  const toggleImageBlur = (messageId: string) => {
    ChatMessageService.toggleImageBlur(messageId, setMessages);
  };
  
  // Open image preview
  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };
  
  // Show blocked users list
  const showBlockedUsersList = () => {
    setIsBlockedUsersDialogOpen(true);
    setShowOptions(false);
  };
  
  // Toggle translation
  const toggleTranslation = () => {
    setIsTranslationEnabled(!isTranslationEnabled);
    setShowOptions(false);
  };
  
  // Show media gallery
  const showMediaGallery = () => {
    setIsMediaGalleryOpen(true);
    setShowOptions(false);
  };
  
  // Delete conversation
  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
    setShowOptions(false);
  };
  
  // Confirm delete conversation
  const confirmDeleteConversation = () => {
    // Delete all messages for this user
    signalRService.deleteAllMessages(userId);
    
    // Clear local messages
    setMessages([]);
    setMediaGalleryItems([]);
    
    // Close dialog
    setIsDeleteDialogOpen(false);
    
    toast.success("Conversation deleted successfully");
  };
  
  // Cancel delete conversation
  const cancelDeleteConversation = () => {
    setIsDeleteDialogOpen(false);
  };
  
  // Reply to a message
  const replyToMessage = (messageId: string, messageText: string) => {
    // Find the message to reply to
    const messageToReply = messages.find(msg => msg.id === messageId);
    
    if (messageToReply) {
      // Mark all messages as not being replied to
      setMessages(messages.map(msg => ({ ...msg, isBeingRepliedTo: false })));
      
      // Mark this message as being replied to
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, isBeingRepliedTo: true } : msg
      ));
      
      // Focus the input field
      const messageInput = document.querySelector('input[name="message"]');
      if (messageInput) {
        (messageInput as HTMLInputElement).focus();
      }
      
      toast.info(`Replying to: ${messageText.slice(0, 30)}${messageText.length > 30 ? '...' : ''}`);
    }
  };
  
  // Unsend (delete) a message
  const unsendMessage = (messageId: string) => {
    // Only allow unsending own messages
    const messageToDelete = messages.find(msg => msg.id === messageId);
    
    if (!messageToDelete || messageToDelete.senderId !== signalRService.currentUserId) {
      toast.error("You can only unsend your own messages");
      return;
    }
    
    // Call signalR service to mark as deleted
    signalRService.deleteMessage(messageId, userId);
    
    // Update local message
    ChatMessageService.markAsDeleted(messageId, setMessages);
    
    toast.success("Message unsent");
  };
  
  // Helper functions
  const isLinkMessage = (content: string) => {
    return /https?:\/\/[^\s]+/.test(content);
  };
  
  const extractLink = (content: string) => {
    const match = content.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : '';
  };
  
  const translateMessage = async (msg: ChatMessage): Promise<ChatMessage> => {
    // Mock translation for demo purposes
    return {
      ...msg,
      content: msg.content ? `[Translated to ${selectedLanguage}] ${msg.content}` : undefined
    };
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
  };
};
