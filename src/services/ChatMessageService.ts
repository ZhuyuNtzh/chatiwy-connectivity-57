
import { signalRService } from './signalRService';
import type { ChatMessage } from './signalR/types';
import { toast } from "sonner";

export class ChatMessageService {
  // Send a new message
  static sendMessage(
    userId: number, 
    content: string, 
    username: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): void {
    if (signalRService.isUserBlocked(userId)) {
      toast.error(`You have blocked this user and cannot send messages.`);
      return;
    }
    
    // Create a message with the correct username
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: content.trim(),
      sender: username,
      actualUsername: username, // This is the correct username to display
      senderId: signalRService.currentUserId,
      recipientId: userId,
      timestamp: new Date(),
      isRead: true, // Mark as read since it's our own message
    };
    
    // Add message to local state first for immediate UI update
    setMessages(prev => [...prev, newMessage]);
    
    // Then send to service - pass the actual username so it can be stored with the message
    signalRService.sendMessage(userId, content.trim(), username);
  }
  
  // Load messages for a user
  static loadMessages(
    userId: number,
    isTranslationEnabled: boolean,
    userRole: string,
    selectedLanguage: string,
    translateMessage: (msg: ChatMessage) => Promise<ChatMessage>,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>,
    isLinkMessage: (content: string) => boolean,
    extractLink: (content: string) => string
  ): void {
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
  }
  
  // Toggle image blur
  static toggleImageBlur(
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): void {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isBlurred: !msg.isBlurred } : msg
    ));
  }
  
  // Mark a message as deleted
  static markAsDeleted(
    messageId: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ): void {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isDeleted: true } 
          : msg
      )
    );
  }
  
  // Process a new incoming message
  static processNewMessage(
    msg: ChatMessage,
    userId: number,
    isTranslationEnabled: boolean,
    userRole: string,
    selectedLanguage: string,
    translateMessage: (msg: ChatMessage) => Promise<ChatMessage>,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>,
    isLinkMessage: (content: string) => boolean,
    extractLink: (content: string) => string,
    isAtBottom: boolean,
    setAutoScrollToBottom: (value: boolean) => void
  ): void {
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
      
      if (isAtBottom) {
        setAutoScrollToBottom(true);
        
        setTimeout(() => {
          setAutoScrollToBottom(false);
        }, 300);
      }
    } else {
      console.log(`Message not for conversation with user ${userId}:`, msg);
    }
  }
}
