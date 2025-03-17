
import { ChatMessage } from './types';

export const messageHandler = {
  createMessage({
    content,
    sender,
    actualUsername,
    senderId,
    recipientId,
    replyToId,
    replyText,
    isRead = false,
  }: {
    content: string;
    sender: string;
    actualUsername?: string | null;
    senderId: number;
    recipientId: number;
    replyToId?: string;
    replyText?: string;
    isRead?: boolean;
  }): ChatMessage {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content,
      sender,
      actualUsername,
      senderId,
      recipientId,
      timestamp: new Date(),
      status: 'sent',
      replyToId,
      replyText,
      isRead,
    };
  },

  createImageMessage({
    sender,
    senderId,
    recipientId,
    imageUrl,
    isBlurred = false,
    isRead = false,
  }: {
    sender: string;
    senderId: number;
    recipientId: number;
    imageUrl: string;
    isBlurred?: boolean;
    isRead?: boolean;
  }): ChatMessage {
    return {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: 'Image message',
      sender,
      senderId,
      recipientId,
      timestamp: new Date(),
      isImage: true,
      imageUrl,
      isBlurred,
      status: 'sent',
      isRead,
    };
  },

  createVoiceMessage({
    sender,
    senderId,
    recipientId,
    audioUrl,
    isRead = false,
  }: {
    sender: string;
    senderId: number;
    recipientId: number;
    audioUrl: string;
    isRead?: boolean;
  }): ChatMessage {
    return {
      id: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: 'Voice message',
      sender,
      senderId,
      recipientId,
      timestamp: new Date(),
      isVoiceMessage: true,
      audioUrl,
      status: 'sent',
      isRead,
    };
  },

  createSimulatedResponse({
    senderId,
    recipientId,
    actualUsername,
    isRead = false,
  }: {
    senderId: number;
    recipientId: number;
    actualUsername?: string;
    isRead?: boolean;
  }): ChatMessage {
    // Use the actual username if provided
    const sender = actualUsername || `User${senderId}`;
    
    // Generate random responses
    const responses = [
      "Hi there! How are you?",
      "Nice to meet you!",
      "Have you traveled anywhere interesting recently?",
      "What are your hobbies?",
      "Do you have any recommendations for good books?",
      "I've been learning to play the guitar lately.",
      "Have you watched any good movies lately?",
      "What's your favorite type of cuisine?",
      "How's the weather where you are?",
      "I'm thinking about getting a pet. Any suggestions?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: randomResponse,
      sender,
      actualUsername: sender, // Set actualUsername correctly
      senderId,
      recipientId,
      timestamp: new Date(),
      status: 'delivered',
      isRead,
    };
  }
};
