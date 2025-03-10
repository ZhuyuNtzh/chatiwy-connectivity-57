
import { useState, useEffect, useRef } from 'react';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';
import { toast } from "sonner";

export const useChat = (userId: number, userRole: string) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [otherReportReason, setOtherReportReason] = useState('');
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<number[]>([]);
  const [isBlockedUsersDialogOpen, setIsBlockedUsersDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxChars = userRole === 'vip' ? 200 : 140;
  
  // Auto-scroll state
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(false);
  
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      // Only process messages specific to this conversation
      // This ensures messages only show up in the chat with the correct senderId
      if (msg.senderId === userId || (msg.senderId === 0 && userId === msg.recipientId)) {
        setMessages(prev => [...prev, msg]);
        
        // Auto-scroll when receiving a new message from this user
        setAutoScrollToBottom(true);
        
        // Reset auto-scroll after a short delay
        setTimeout(() => {
          setAutoScrollToBottom(false);
        }, 100);
      }
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    
    // Load existing messages specifically for this user
    const existingMessages = signalRService.getChatHistory(userId);
    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages);
    }
    
    // Check if this user is already blocked
    if (signalRService.isUserBlocked(userId)) {
      setBlockedUsers(prev => [...prev, userId]);
    }
    
    return () => {
      // Cleanup
      signalRService.offMessageReceived(handleNewMessage);
    };
  }, [userId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(userId)) {
      toast.error(`You have blocked this user and cannot send messages.`);
      return;
    }
    
    signalRService.sendMessage(userId, message.trim());
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAddEmoji = (emoji: string) => {
    if (message.length + emoji.length <= maxChars) {
      setMessage(prev => prev + emoji);
    }
  };
  
  const handleBlockUser = () => {
    setIsBlockDialogOpen(true);
    setShowOptions(false);
  };
  
  const confirmBlockUser = () => {
    signalRService.blockUser(userId);
    setBlockedUsers(prev => [...prev, userId]);
    toast.success(`User has been blocked.`);
    setIsBlockDialogOpen(false);
  };
  
  const handleUnblockUser = (userId: number, username: string) => {
    signalRService.unblockUser(userId);
    setBlockedUsers(prev => prev.filter(id => id !== userId));
    toast.success(`${username} has been unblocked.`);
  };
  
  const handleReportUser = () => {
    setIsReportDialogOpen(true);
    setShowOptions(false);
  };
  
  const handleSubmitReport = () => {
    if (selectedReportReason === 'other' && !otherReportReason.trim()) {
      toast.error('Please provide details for your report');
      return;
    }
    
    const reportReasons = [
      { id: 'underage', label: 'Underage User: The user appears to be below the required age (18+).' },
      { id: 'harassment', label: 'Harassment/Hate Speech: The user is engaging in abusive, discriminatory, or hateful language.' },
      { id: 'illegal', label: 'Illegal Activity: The user is discussing or promoting illegal actions.' },
      { id: 'personal_info', label: 'Sharing Personal Information and nudity: The user is disclosing sensitive personal details or photos.' },
      { id: 'other', label: 'Other' }
    ];
    
    const reason = selectedReportReason === 'other' 
      ? otherReportReason 
      : reportReasons.find(r => r.id === selectedReportReason)?.label || '';
    
    console.log('Reporting user for', reason);
    toast.success(`Report submitted successfully`);
    setIsReportDialogOpen(false);
    setSelectedReportReason('');
    setOtherReportReason('');
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
        setIsImageDialogOpen(true);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  const handleSendImage = () => {
    if (imagePreview) {
      signalRService.sendImage(userId, imagePreview, true);
      setIsImageDialogOpen(false);
      setImagePreview(null);
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
    // Get the current blocked users from the service
    const blockedIds = signalRService.getBlockedUsers();
    setBlockedUsers(blockedIds);
    setIsBlockedUsersDialogOpen(true);
    setShowOptions(false);
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
    toggleImageBlur,
    openImagePreview,
    showBlockedUsersList
  };
};
