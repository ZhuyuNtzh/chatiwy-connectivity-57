
import { chatStorage } from './chatStorage';
import { messageHandler } from './messageHandler';
import { ChatMessage } from './types';

// Mock user names for generating responses
const mockUserNames: Record<number, string> = {
  1: "Alice",
  2: "Bob",
  3: "Clara",
  4: "David",
  5: "Elena",
  6: "Feng",
  7: "Gabriela",
  8: "Hiroshi",
  9: "Isabella",
  10: "Jamal",
  11: "TravelBot",
  12: "FitnessGuru",
  13: "BookWorm",
  14: "TechGeek",
  15: "ArtLover"
};

// Message handling functionality
export const messageService = {
  messageCallbacks: [] as ((message: ChatMessage) => void)[],
  typingCallbacks: [] as ((userId: number) => void)[],
  deleteCallbacks: [] as ((messageId: string) => void)[],
  
  onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  },
  
  offMessageReceived(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  },
  
  onMessageDeleted(callback: (messageId: string) => void): void {
    this.deleteCallbacks.push(callback);
  },
  
  offMessageDeleted(callback: (messageId: string) => void): void {
    this.deleteCallbacks = this.deleteCallbacks.filter(cb => cb !== callback);
  },
  
  onUserTyping(callback: (userId: number) => void): void {
    this.typingCallbacks.push(callback);
  },
  
  offUserTyping(callback: (userId: number) => void): void {
    this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
  },
  
  async sendMessage(
    currentUserId: number,
    currentUsername: string | null,
    recipientId: number, 
    content: string, 
    actualUsername?: string,
    replyToId?: string,
    replyText?: string
  ): Promise<void> {
    const newMessage = messageHandler.createMessage({
      content,
      sender: currentUsername || 'You',
      actualUsername: actualUsername || currentUsername,
      senderId: currentUserId,
      recipientId,
      replyToId,
      replyText
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(currentUserId, newMessage);
    
    return Promise.resolve();
  },
  
  async sendImage(
    currentUserId: number,
    currentUsername: string | null,
    recipientId: number, 
    imageUrl: string, 
    isBlurred: boolean = false
  ): Promise<void> {
    const newMessage = messageHandler.createImageMessage({
      sender: currentUsername || 'You',
      senderId: currentUserId,
      recipientId,
      imageUrl,
      isBlurred
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(currentUserId, newMessage);
    
    return Promise.resolve();
  },
  
  async sendVoiceMessage(
    currentUserId: number,
    currentUsername: string | null,
    recipientId: number, 
    audioUrl: string
  ): Promise<void> {
    const newMessage = messageHandler.createVoiceMessage({
      sender: currentUsername || 'You',
      senderId: currentUserId,
      recipientId,
      audioUrl
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(currentUserId, newMessage);
    
    return Promise.resolve();
  },
  
  async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    // Update chat history
    chatStorage.markMessageAsDeleted(recipientId, messageId);
    
    // Notify listeners
    this.deleteCallbacks.forEach(callback => callback(messageId));
    
    return Promise.resolve();
  },
  
  sendTypingIndication(recipientId: number): void {
    // Notify typing listeners
    this.typingCallbacks.forEach(callback => callback(recipientId));
  },
  
  // Helper to simulate received messages
  simulateReceivedMessage(
    currentUserId: number | null,
    recipientUserId: number
  ): void {
    // Get the mock username from recipientUserId
    const senderName = mockUserNames[recipientUserId] || `User${recipientUserId}`;
    
    const newMessage = messageHandler.createSimulatedResponse({
      // This is the ID of the user we're chatting with (they are sending the response)
      senderId: recipientUserId,
      // This is our user ID (we are receiving the message)
      recipientId: currentUserId || 0,
      // Use the actual username we determined
      actualUsername: senderName
    });
    
    // Add to chat history - use the current user's ID as the key
    chatStorage.addMessageToHistory(currentUserId || 0, newMessage);
    
    // Notify message listeners
    this.messageCallbacks.forEach(callback => callback(newMessage));
  }
}
