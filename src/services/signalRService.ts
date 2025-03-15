
import { MockHubConnection } from './signalR/mockConnection';
import { ISignalRService, ChatMessage, ConnectionStatus, UserReport } from './signalR/types';
import { messageHandler } from './signalR/messageHandler';
import { userBlocking } from './signalR/userBlocking';
import { chatStorage } from './signalR/chatStorage';
import { userReporting } from './signalR/userReporting';
import { contentModeration } from './signalR/contentModeration';

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
      this.connection = null;
      this.userId = null;
      this.username = null;
      console.log('SignalR disconnected');
    }
    return Promise.resolve();
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
    if (userBlocking.isUserBlocked(recipientId)) {
      console.log(`Cannot send message to blocked user ${recipientId}`);
      return Promise.resolve();
    }
    
    const newMessage = messageHandler.createMessage({
      content,
      sender: this.username || 'You',
      actualUsername: actualUsername || this.username,
      senderId: this.userId || 0,
      recipientId,
      replyToId,
      replyText
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(recipientId, newMessage);
    
    // Simulate a response - pass the actual username to create a proper response
    setTimeout(() => {
      this.simulateReceivedMessage(recipientId, actualUsername);
    }, 1000 + Math.random() * 2000);
    
    return Promise.resolve();
  }
  
  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<void> {
    if (userBlocking.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    const newMessage = messageHandler.createImageMessage({
      sender: this.username || 'You',
      senderId: this.userId || 0,
      recipientId,
      imageUrl,
      isBlurred
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(recipientId, newMessage);
    
    return Promise.resolve();
  }
  
  public async sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void> {
    if (userBlocking.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    const newMessage = messageHandler.createVoiceMessage({
      sender: this.username || 'You',
      senderId: this.userId || 0,
      recipientId,
      audioUrl
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(recipientId, newMessage);
    
    return Promise.resolve();
  }
  
  public async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    // Update chat history
    chatStorage.markMessageAsDeleted(recipientId, messageId);
    
    // Notify listeners
    this.deleteCallbacks.forEach(callback => callback(messageId));
    
    return Promise.resolve();
  }
  
  public sendTypingIndication(recipientId: number): void {
    // Notify typing listeners
    this.typingCallbacks.forEach(callback => callback(recipientId));
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
    return chatStorage.getChatHistory(userId);
  }
  
  public getAllChatHistory(): Record<number, ChatMessage[]> {
    return chatStorage.getAllChatHistory();
  }
  
  public clearAllChatHistory(): void {
    chatStorage.clearAllChatHistory();
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
  private simulateReceivedMessage(senderId: number, actualUsername?: string): void {
    // Skip for blocked users
    if (userBlocking.isUserBlocked(senderId)) {
      return;
    }
    
    const newMessage = messageHandler.createSimulatedResponse({
      senderId,
      recipientId: this.userId || 0,
      actualUsername
    });
    
    // Add to chat history
    chatStorage.addMessageToHistory(senderId, newMessage);
    
    // Notify message listeners
    this.messageCallbacks.forEach(callback => callback(newMessage));
  }
}

export const signalRService = new SignalRService();
