
import { ChatMessage } from './types';

interface MessageData {
  content?: string;
  sender: string;
  actualUsername?: string | null;
  senderId: number;
  recipientId: number;
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
      status: 'sent'
    };
  },

  createImageMessage(data: ImageMessageData): ChatMessage {
    return {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      sender: data.sender,
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
    // This is the key change - we want to show the actual username of the sender here
    // So we're using data.senderId as the username now
    const senderName = `User${data.senderId}`;
    
    return {
      id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: randomResponse,
      sender: senderName,
      // Use actual username of the recipient as the actual username for the message
      // This is what the recipient will see as the sender name
      actualUsername: senderName,
      senderId: data.senderId,
      recipientId: data.recipientId,
      timestamp: new Date(),
      status: 'delivered'
    };
  }
};
