
import { MockHubConnection } from './signalR/mockConnection';
import { ISignalRService, ChatMessage, ConnectionStatus, UserReport } from './signalR/types';
import { messageHandler } from './signalR/messageHandler';
import { userBlocking } from './signalR/userBlocking';
import { chatStorage } from './signalR/chatStorage';
import { userReporting } from './signalR/userReporting';
import { contentModeration } from './signalR/contentModeration';

// Mock users data for generating realistic responses
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

// This is using the mock connection for now, but can be replaced with a real connection
class SignalRService implements ISignalRService {
  private connection: any = null;
  private userId: number | null = null;
  private username: string | null = null;
  private connectedUsersCount = 0;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((userId: number) => void)[] = [];
  private deleteCallbacks: ((messageId: string) => void)[] = [];
  
  public get currentUserId(): number {
    return this.userId || 0;
  }

  public async initialize(userId: number, username: string): Promise<void> {
    // Clear any previous user data if there was a session
    if (this.userId && this.userId !== userId) {
      this.clearUserSession(this.userId);
    }
    
    this.userId = userId;
    this.username = username;
    
    // Load data from localStorage
    userBlocking.loadFromStorage();
    chatStorage.loadFromStorage();
    userReporting.loadFromStorage();
    contentModeration.loadFromStorage();
    
    this.connection = new MockHubConnection();
    this.connectedUsersCount = Math.floor(Math.random() * 100) + 50; // Random number of users for mock
    
    console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
    return Promise.resolve();
  }
  
  public async disconnect(): Promise<void> {
    if (this.connection) {
      if (this.userId) {
        // Clear user session data on disconnect
        this.clearUserSession(this.userId);
      }
      
      this.connection = null;
      this.userId = null;
      this.username = null;
      console.log('SignalR disconnected');
    }
    return Promise.resolve();
  }
  
  private clearUserSession(userId: number): void {
    chatStorage.clearUserSession(userId);
  }
  
  public onConnectedUsersCountChanged(callback: (count: number) => void): void {
    // For mock purposes, just return the stored count
    callback(this.connectedUsersCount);
  }
  
  // Message handling
  public onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks.push(callback);
  }
  
  public offMessageReceived(callback: (message: ChatMessage) => void): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }
  
  public onMessageDeleted(callback: (messageId: string) => void): void {
    this.deleteCallbacks.push(callback);
  }
  
  public offMessageDeleted(callback: (messageId: string) => void): void {
    this.deleteCallbacks = this.deleteCallbacks.filter(cb => cb !== callback);
  }
  
  public onUserTyping(callback: (userId: number) => void): void {
    this.typingCallbacks.push(callback);
  }
  
  public offUserTyping(callback: (userId: number) => void): void {
    this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
  }
  
  public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): void {
    callback('connected'); // Always connected in mock
  }
  
  // Message sending
  public async sendMessage(
    recipientId: number, 
    content: string, 
    actualUsername?: string,
    replyToId?: string,
    replyText?: string
  ): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    if (userBlocking.isUserBlocked(recipientId)) {
      console.log(`Cannot send message to blocked user ${recipientId}`);
      return Promise.resolve();
    }
    
    const newMessage = messageHandler.createMessage({
      content,
      sender: this.username || 'You',
      actualUsername: actualUsername || this.username,
      senderId: this.userId,
      recipientId,
      replyToId,
      replyText,
      isRead: true // Our own messages are always read
    });
    
    // Add to chat history with the current user ID
    chatStorage.addMessageToHistory(this.userId, this.userId, newMessage);
    
    // Simulate a response - pass the actual username to create a proper response
    setTimeout(() => {
      this.simulateReceivedMessage(recipientId);
    }, 1000 + Math.random() * 2000);
    
    return Promise.resolve();
  }
  
  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    if (userBlocking.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    const newMessage = messageHandler.createImageMessage({
      sender: this.username || 'You',
      senderId: this.userId,
      recipientId,
      imageUrl,
      isBlurred,
      isRead: true // Our own messages are always read
    });
    
    // Add to chat history with the current user ID
    chatStorage.addMessageToHistory(this.userId, this.userId, newMessage);
    
    return Promise.resolve();
  }
  
  public async sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    if (userBlocking.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    const newMessage = messageHandler.createVoiceMessage({
      sender: this.username || 'You',
      senderId: this.userId,
      recipientId,
      audioUrl,
      isRead: true // Our own messages are always read
    });
    
    // Add to chat history with the current user ID
    chatStorage.addMessageToHistory(this.userId, this.userId, newMessage);
    
    return Promise.resolve();
  }
  
  public async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    if (!this.userId) return Promise.resolve();
    
    // Update chat history
    chatStorage.markMessageAsDeleted(this.userId, recipientId, messageId);
    
    // Notify listeners
    this.deleteCallbacks.forEach(callback => callback(messageId));
    
    return Promise.resolve();
  }
  
  public sendTypingIndication(recipientId: number): void {
    // Notify typing listeners
    this.typingCallbacks.forEach(callback => callback(recipientId));
  }
  
  // Message read status
  public markMessagesAsRead(senderId: number): void {
    if (!this.userId) return;
    
    // Update message read status in chat storage
    chatStorage.markMessagesAsRead(this.userId, senderId, this.userId);
  }
  
  // User blocking
  public blockUser(userId: number): void {
    userBlocking.blockUser(userId);
  }
  
  public unblockUser(userId: number): void {
    userBlocking.unblockUser(userId);
  }
  
  public isUserBlocked(userId: number): boolean {
    return userBlocking.isUserBlocked(userId);
  }
  
  public isAdminUser(userId: number): boolean {
    // Admin users have a special ID range (e.g., 999 as defined in useSignalRConnection.ts)
    return userId === 999;
  }
  
  public getBlockedUsers(): number[] {
    return userBlocking.getBlockedUsers();
  }
  
  // Chat history management
  public getChatHistory(userId: number): ChatMessage[] {
    if (!this.userId) return [];
    
    // If userId is 0, return all messages for the current user (for admin purposes)
    if (userId === 0) {
      return this.getAllMessages();
    }
    
    return chatStorage.getChatHistory(this.userId, userId);
  }
  
  public getAllMessages(): ChatMessage[] {
    // This method retrieves all messages from all chats for admin purposes
    if (!this.userId) return [];
    
    const allChatHistory = chatStorage.getAllChatHistory(this.userId);
    let allMessages: ChatMessage[] = [];
    
    // Flatten all the chat history messages into a single array
    Object.values(allChatHistory).forEach(messages => {
      allMessages = [...allMessages, ...messages];
    });
    
    return allMessages;
  }
  
  public getAllChatHistory(): Record<number, ChatMessage[]> {
    if (!this.userId) return {};
    return chatStorage.getAllChatHistory(this.userId);
  }
  
  public clearAllChatHistory(): void {
    if (!this.userId) return;
    chatStorage.clearAllChatHistory(this.userId);
  }
  
  // Banned words management
  public getBannedWords(): string[] {
    return contentModeration.getBannedWords();
  }
  
  public addBannedWord(word: string): void {
    contentModeration.addBannedWord(word);
  }
  
  public removeBannedWord(word: string): void {
    contentModeration.removeBannedWord(word);
  }
  
  public setBannedWords(words: string[]): void {
    contentModeration.setBannedWords(words);
  }
  
  // Reporting functionality
  public reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ): void {
    userReporting.reportUser(reporterId, reporterName, reportedId, reportedName, reason, details);
  }
  
  public getReports(): UserReport[] {
    return userReporting.getReports();
  }
  
  public deleteReport(reportId: string): void {
    userReporting.deleteReport(reportId);
  }
  
  // Helper method to simulate received messages
  private simulateReceivedMessage(recipientUserId: number): void {
    if (!this.userId) return;
    
    // Skip for blocked users
    if (userBlocking.isUserBlocked(recipientUserId)) {
      return;
    }
    
    // Get the mock username from recipientUserId
    const senderName = mockUserNames[recipientUserId] || `User${recipientUserId}`;
    
    const newMessage = messageHandler.createSimulatedResponse({
      // This is the ID of the user we're chatting with (they are sending the response)
      senderId: recipientUserId,
      // This is our user ID (we are receiving the message)
      recipientId: this.userId,
      // Use the actual username we determined
      actualUsername: senderName,
      // Mark as unread by default for incoming messages
      isRead: false
    });
    
    // Add to chat history - use the current user's ID as the key
    chatStorage.addMessageToHistory(this.userId, this.userId, newMessage);
    
    // Notify message listeners
    this.messageCallbacks.forEach(callback => callback(newMessage));
  }
}

export const signalRService = new SignalRService();
