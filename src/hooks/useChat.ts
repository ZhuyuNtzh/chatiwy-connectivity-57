import { useState, useEffect, useRef } from 'react';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';
import { toast } from "sonner";
import axios from 'axios';

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
  const [isTyping, setIsTyping] = useState(false);
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaGalleryItems, setMediaGalleryItems] = useState<{
    type: 'image' | 'voice' | 'link';
    url: string;
    timestamp: Date;
  }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const maxChars = userRole === 'vip' ? 200 : 140;
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-scroll state with a ref to track whether we need to scroll
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
    
    signalRService.onMessageReceived(handleNewMessage);
    signalRService.onUserTyping(handleUserTyping);
    
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
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [userId, userRole, isTranslationEnabled, selectedLanguage]);

  // Simulate translation API call (would be replaced with actual API)
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
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(userId)) {
      toast.error(`You have blocked this user and cannot send messages.`);
      return;
    }
    
    signalRService.sendMessage(userId, message.trim());
    setMessage('');
    
    // Set auto-scroll to true when sending a message
    setAutoScrollToBottom(true);
    setTimeout(() => setAutoScrollToBottom(false), 300);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (userRole === 'vip') {
      // Send typing indication for VIP users
      signalRService.sendTypingIndication(userId);
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
  
  const handleVoiceMessageClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startRecording(stream);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error('Could not access microphone. Please check permissions.');
      }
    }
  };
  
  const startRecording = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.onstart = () => {
      setIsRecording(true);
    };
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioPreview(audioUrl);
      setIsRecording(false);
      
      // Send the voice message
      sendVoiceMessage(audioUrl);
      
      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Automatically stop recording after 60 seconds (for VIP) or 30 seconds (for regular)
    const maxRecordingTime = userRole === 'vip' ? 60000 : 30000;
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, maxRecordingTime);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  const sendVoiceMessage = (audioUrl: string) => {
    if (!audioUrl) return;
    
    // In a real app, you would upload the audio file to a server
    // and then send a reference to it via SignalR
    
    signalRService.sendVoiceMessage(userId, audioUrl);
    
    // Set auto-scroll to true when sending a message
    setAutoScrollToBottom(true);
    setTimeout(() => setAutoScrollToBottom(false), 300);
    
    // Clear audio preview
    setAudioPreview(null);
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
    // Show confirmation dialog instead of deleting immediately
    setIsDeleteDialogOpen(true);
    setShowOptions(false);
  };
  
  const confirmDeleteConversation = () => {
    // Actually delete the conversation after confirmation
    setMessages([]);
    setMediaGalleryItems([]);
    toast.success('Conversation deleted');
    setIsDeleteDialogOpen(false);
  };
  
  const cancelDeleteConversation = () => {
    setIsDeleteDialogOpen(false);
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
    cancelDeleteConversation
  };
};
