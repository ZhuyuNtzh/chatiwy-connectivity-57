
import { ISignalRService, ChatMessage, ConnectionStatus, UserReport } from './signalR/types';
import { chatStorage } from './signalR/chatStorage';
import { userBlocking } from './signalR/userBlocking';
import { messageService } from './signalR/messageService';
import { adminService } from './signalR/adminService';
import { connectionService } from './signalR/connectionService';

// This is using the mock connection for now, but can be replaced with a real connection
class SignalRService implements ISignalRService {
  
  public get currentUserId(): number {
    return connectionService.currentUserId;
  }

  public async initialize(userId: number, username: string): Promise<void> {
    // Load data from localStorage
    userBlocking.loadFromStorage();
    chatStorage.loadFromStorage();
    
    return connectionService.initialize(userId, username);
  }
  
  public async disconnect(): Promise<void> {
    return connectionService.disconnect();
  }
  
  public onConnectedUsersCountChanged(callback: (count: number) => void): void {
    connectionService.onConnectedUsersCountChanged(callback);
  }
  
  // Message handling
  public onMessageReceived(callback: (message: ChatMessage) => void): void {
    messageService.onMessageReceived(callback);
  }
  
  public offMessageReceived(callback: (message: ChatMessage) => void): void {
    messageService.offMessageReceived(callback);
  }
  
  public onMessageDeleted(callback: (messageId: string) => void): void {
    messageService.onMessageDeleted(callback);
  }
  
  public offMessageDeleted(callback: (messageId: string) => void): void {
    messageService.offMessageDeleted(callback);
  }
  
  public onUserTyping(callback: (userId: number) => void): void {
    messageService.onUserTyping(callback);
  }
  
  public offUserTyping(callback: (userId: number) => void): void {
    messageService.offUserTyping(callback);
  }
  
  public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): void {
    connectionService.onConnectionStatusChanged(callback);
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
    
    await messageService.sendMessage(
      connectionService.currentUserId,
      connectionService.currentUsername,
      recipientId,
      content,
      actualUsername,
      replyToId,
      replyText
    );
    
    // Simulate a response
    setTimeout(() => {
      messageService.simulateReceivedMessage(connectionService.currentUserId, recipientId);
    }, 1000 + Math.random() * 2000);
    
    return Promise.resolve();
  }
  
  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<void> {
    if (userBlocking.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    return messageService.sendImage(
      connectionService.currentUserId,
      connectionService.currentUsername,
      recipientId,
      imageUrl,
      isBlurred
    );
  }
  
  public async sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void> {
    if (userBlocking.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    return messageService.sendVoiceMessage(
      connectionService.currentUserId,
      connectionService.currentUsername,
      recipientId,
      audioUrl
    );
  }
  
  public async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    return messageService.deleteMessage(messageId, recipientId);
  }
  
  public sendTypingIndication(recipientId: number): void {
    messageService.sendTypingIndication(recipientId);
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
    return connectionService.isAdminUser(userId);
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
  
  // Admin operations
  public reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ): void {
    adminService.reportUser(reporterId, reporterName, reportedId, reportedName, reason, details);
  }
  
  public getReports(): UserReport[] {
    return adminService.getReports();
  }
  
  public deleteReport(reportId: string): void {
    adminService.deleteReport(reportId);
  }
  
  public getBannedWords(): string[] {
    return adminService.getBannedWords();
  }
  
  public addBannedWord(word: string): void {
    adminService.addBannedWord(word);
  }
  
  public removeBannedWord(word: string): void {
    adminService.removeBannedWord(word);
  }
  
  public setBannedWords(words: string[]): void {
    adminService.setBannedWords(words);
  }
}

export const signalRService = new SignalRService();
