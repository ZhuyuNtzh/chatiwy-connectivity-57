
import { ChatMessage } from './types';

interface MessageData {
  content?: string;
  sender: string;
  actualUsername?: string | null;
  senderId: number;
  recipientId: number;
  replyToId?: string;
  replyText?: string;
}

interface ImageMessageData {
  sender: string;
  senderId: number;
  recipientId: number;
  imageUrl: string;
  isBlurred: boolean;
}

interface VoiceMessageData {
  sender: string;
  senderId: number;
  recipientId: number;
  audioUrl: string;
}

interface ResponseData {
  senderId: number;
  recipientId: number;
  actualUsername?: string | null;
}

export const messageHandler = {
  createMessage(data: MessageData): ChatMessage {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: data.content,
      sender: data.sender,
      actualUsername: data.actualUsername || data.sender,
      senderId: data.senderId,
      recipientId: data.recipientId,
      timestamp: new Date(),
      status: 'sent',
      replyToId: data.replyToId,
      replyText: data.replyText
    };
  },

  createImageMessage(data: ImageMessageData): ChatMessage {
    return {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: data.sender,
      actualUsername: data.sender,
      senderId: data.senderId,
      recipientId: data.recipientId,
      timestamp: new Date(),
      isImage: true,
      imageUrl: data.imageUrl,
      isBlurred: data.isBlurred,
      status: 'sent'
    };
  },

  createVoiceMessage(data: VoiceMessageData): ChatMessage {
    return {
      id: `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: data.sender,
      actualUsername: data.sender,
      senderId: data.senderId,
      recipientId: data.recipientId,
      timestamp: new Date(),
      isVoiceMessage: true,
      audioUrl: data.audioUrl,
      status: 'sent'
    };
  },

  createSimulatedResponse(data: ResponseData): ChatMessage {
    // Get a random response
    const responses = [
      "Hi there! How are you?",
      "Nice to meet you!",
      "What are you up to today?",
      "That's interesting!",
      "Tell me more about yourself.",
      "I'm having a great day so far.",
      "Do you have any hobbies?",
      "Have you traveled anywhere interesting recently?",
      "What movies do you enjoy watching?",
      "I like your style!"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // CRITICAL FIX: This is where we need to fix the sender name
    // First, ensure the IDs are correctly swapped for response messages
    // The responder's ID should be data.senderId (who we're talking to)
    // The recipient's ID should be data.recipientId (the current user)
    
    return {
      id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: randomResponse,
      // This ensures the sender name is the actual username
      sender: data.actualUsername || `User${data.senderId}`,
      // Use the actual username for display
      actualUsername: data.actualUsername || `User${data.senderId}`,
      // Fix: Make sure the sender ID is the user we're talking to
      senderId: data.senderId,
      // Fix: Make sure recipient ID is the current user
      recipientId: data.recipientId,
      timestamp: new Date(),
      status: 'delivered'
    };
  }
};
