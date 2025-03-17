
import * as signalR from '@microsoft/signalr';
import { ChatMessage, UserReport } from './signalR/types';
import { chatStorage } from './signalR/chatStorage';

class SignalRService {
  private connection: any = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private messageHandlers: ((message: any) => void)[] = [];
  private typingHandlers: ((userId: number) => void)[] = [];
  private messageDeletedHandlers: ((messageId: string) => void)[] = [];
  private connectedUsersCountHandlers: ((count: number) => void)[] = [];
  
  // Add this property to track the currently selected user in the chat
  public selectedUserId: number | null = null;

  public currentUserId: number | null = null;
  private bannedWords: string[] = [];
  private reports: UserReport[] = [];

  constructor() {
    chatStorage.loadFromStorage();
    // Load banned words from localStorage if available
    const savedBannedWords = localStorage.getItem('bannedWords');
    if (savedBannedWords) {
      this.bannedWords = JSON.parse(savedBannedWords);
    }
  }

  public initialize(userId: number, username: string): void {
    this.currentUserId = userId;
    // In a real app, this would connect to the server
    console.log(`Initialized SignalR for user ${username} (ID: ${userId})`);
  }

  public async startConnection(user: any): Promise<void> {
    if (this.connectionPromise || this.isConnecting) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.currentUserId = user.id;

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        this.connection = new signalR.HubConnectionBuilder()
          .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/chatHub`, {
            accessTokenFactory: () => user.token
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        this.connection.on('ReceiveMessage', (message: ChatMessage) => {
          this.messageHandlers.forEach(handler => handler(message));
        });

        this.connection.on('UserTyping', (userId: number) => {
          this.typingHandlers.forEach(handler => handler(userId));
        });

        this.connection.on('MessageDeleted', (messageId: string) => {
          this.messageDeletedHandlers.forEach(handler => handler(messageId));
        });

        this.connection.onreconnecting((error: any) => {
          console.log('Attempting to reconnect to SignalR Hub...', error);
        });

        this.connection.onreconnected(() => {
          console.log('Successfully reconnected to SignalR Hub.');
        });

        this.connection.onclose((error: any) => {
          console.log('SignalR Hub connection closed.', error);
          this.connectionPromise = null;
          this.isConnecting = false;
        });

        await this.connection.start();
        console.log('SignalR Hub Connected.');
        resolve();
      } catch (err) {
        console.error('SignalR Connection Error: ', err);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(err);
      } finally {
        this.isConnecting = false;
      }
    });

    return this.connectionPromise;
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR Hub Disconnected.');
      } catch (err) {
        console.error('SignalR Disconnection Error: ', err);
      } finally {
        this.connectionPromise = null;
        this.isConnecting = false;
      }
    }
  }
  
  public disconnect(): void {
    this.stopConnection();
  }

  public onMessageReceived(handler: (message: ChatMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  public offMessageReceived(handler: (message: ChatMessage) => void): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  public onUserTyping(handler: (userId: number) => void): void {
    this.typingHandlers.push(handler);
  }

  public offUserTyping(handler: (userId: number) => void): void {
    this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
  }

  public onMessageDeleted(handler: (messageId: string) => void): void {
    this.messageDeletedHandlers.push(handler);
  }

  public offMessageDeleted(handler: (messageId: string) => void): void {
    this.messageDeletedHandlers = this.messageDeletedHandlers.filter(h => h !== handler);
  }
  
  public onConnectedUsersCountChanged(handler: (count: number) => void): void {
    this.connectedUsersCountHandlers.push(handler);
  }

  public offConnectedUsersCountChanged(handler: (count: number) => void): void {
    this.connectedUsersCountHandlers = this.connectedUsersCountHandlers.filter(h => h !== handler);
  }

  public async sendMessage(userId: number, messageText: string, username?: string, replyToId?: string, replyText?: string): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.invoke('SendMessage', userId, messageText, username || '');
      } else {
        console.log('Simulating message send:', { userId, messageText, username });
      }
    } catch (err) {
      console.error('Error sending message: ', err);
    }
  }

  public async deleteMessage(messageId: string, recipientId?: number): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.invoke('DeleteMessage', messageId);
      } else {
        console.log('Simulating message delete:', messageId);
      }
    } catch (err) {
      console.error('Error deleting message: ', err);
    }
  }

  public async sendTyping(userId: number): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.invoke('SendTyping', userId);
      } else {
        console.log('Simulating typing notification to:', userId);
      }
    } catch (err) {
      console.error('Error sending typing signal: ', err);
    }
  }
  
  public async sendImage(userId: number, imageData: string, isBlurred: boolean): Promise<void> {
    try {
      // In a real app, this would upload the image to a server
      const messageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a message with image data
      const imageMessage: ChatMessage = {
        id: messageId,
        content: 'Sent an image',
        sender: 'You',
        senderId: this.currentUserId || 0,
        recipientId: userId,
        timestamp: new Date(),
        isImage: true,
        imageUrl: imageData,
        isBlurred: isBlurred,
        isRead: true
      };
      
      // Add to chat history
      this.addMessageToChatHistory(this.currentUserId || 0, userId, imageMessage);
      
      // Notify message handlers
      this.messageHandlers.forEach(handler => handler(imageMessage));
      
      console.log('Image sent:', { userId, imageId: messageId });
    } catch (err) {
      console.error('Error sending image: ', err);
    }
  }
  
  public async sendVoiceMessage(userId: number, audioData: string): Promise<void> {
    try {
      // In a real app, this would upload the audio to a server
      const messageId = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a message with audio data
      const voiceMessage: ChatMessage = {
        id: messageId,
        content: 'Sent a voice message',
        sender: 'You',
        senderId: this.currentUserId || 0,
        recipientId: userId,
        timestamp: new Date(),
        isVoiceMessage: true,
        audioUrl: audioData,
        isRead: true
      };
      
      // Add to chat history
      this.addMessageToChatHistory(this.currentUserId || 0, userId, voiceMessage);
      
      // Notify message handlers
      this.messageHandlers.forEach(handler => handler(voiceMessage));
      
      console.log('Voice message sent:', { userId, voiceId: messageId });
    } catch (err) {
      console.error('Error sending voice message: ', err);
    }
  }

  public addMessageToChatHistory(currentUserId: number, userId: number, message: ChatMessage): void {
    chatStorage.addMessageToHistory(currentUserId, userId, message);
  }

  public getChatHistory(userId: number): ChatMessage[] {
    return chatStorage.getChatHistory(this.currentUserId || 0, userId);
  }

  public getAllChatHistory(): Record<number, ChatMessage[]> {
    return chatStorage.getAllChatHistory(this.currentUserId || 0);
  }

  public clearAllChatHistory(): void {
    chatStorage.clearAllChatHistory(this.currentUserId || 0);
  }
  
  public clearChatHistory(userId: number): void {
    chatStorage.clearChatHistory(this.currentUserId || 0, userId);
  }

  public markMessageAsDeleted(messageId: string, userId: number): void {
    chatStorage.markMessageAsDeleted(this.currentUserId || 0, userId, messageId);
  }

  public markMessagesAsRead(userId: number): void {
    chatStorage.markMessagesAsRead(this.currentUserId || 0, userId, this.currentUserId || 0);
  }

  public clearUserSession(): void {
    chatStorage.clearUserSession(this.currentUserId || 0);
  }

  public async blockUser(targetUserId: number): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.invoke('BlockUser', targetUserId);
      } else {
        console.log('Simulating user block:', targetUserId);
        // Store in localStorage for persistence in demo
        const blockedUsers = this.getBlockedUsers();
        if (!blockedUsers.includes(targetUserId)) {
          blockedUsers.push(targetUserId);
          localStorage.setItem(`blockedUsers_${this.currentUserId}`, JSON.stringify(blockedUsers));
        }
      }
    } catch (err) {
      console.error('Error blocking user: ', err);
    }
  }

  public async unblockUser(targetUserId: number): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.invoke('UnblockUser', targetUserId);
      } else {
        console.log('Simulating user unblock:', targetUserId);
        // Remove from localStorage in demo
        const blockedUsers = this.getBlockedUsers();
        const updatedBlockedUsers = blockedUsers.filter(id => id !== targetUserId);
        localStorage.setItem(`blockedUsers_${this.currentUserId}`, JSON.stringify(updatedBlockedUsers));
      }
    } catch (err) {
      console.error('Error unblocking user: ', err);
    }
  }

  public isUserBlocked(userId: number): boolean {
    // Check if the user is in the blocked list
    const blockedUsers = this.getBlockedUsers();
    return blockedUsers.includes(userId);
  }

  public getBlockedUsers(): number[] {
    try {
      if (this.connection) {
        // Assuming there's a method to get blocked users from the server
        // Adjust the method name if it's different
        return this.connection.invoke('GetBlockedUsers') || [];
      } else {
        // For demo, retrieve from localStorage
        const stored = localStorage.getItem(`blockedUsers_${this.currentUserId}`);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Failed to get blocked users:', error);
      return [];
    }
  }

  public async reportUser(targetUserId: number, reason: string, otherReason: string): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.invoke('ReportUser', targetUserId, reason, otherReason);
      } else {
        console.log('Simulating user report:', { targetUserId, reason, otherReason });
        // For demo purposes, store the report locally
        const report: UserReport = {
          id: `report_${Date.now()}`,
          reporterId: this.currentUserId || 0,
          reportedId: targetUserId,
          reporterName: 'Current User',
          reportedName: `User ${targetUserId}`,
          reason: reason,
          details: otherReason,
          timestamp: new Date()
        };
        this.reports.push(report);
        // Store in localStorage for persistence
        localStorage.setItem('userReports', JSON.stringify(this.reports));
      }
    } catch (err) {
      console.error('Error reporting user: ', err);
    }
  }
  
  public isAdminUser(userId: number): boolean {
    // In a real app, this would check if the user has admin role
    // For demo, we'll consider user ID 999 as admin
    return userId === 999;
  }
  
  public getReports(): UserReport[] {
    if (this.reports.length === 0) {
      // Try to load from localStorage for demo
      const stored = localStorage.getItem('userReports');
      if (stored) {
        this.reports = JSON.parse(stored);
      }
    }
    return this.reports;
  }
  
  public deleteReport(reportId: string): void {
    this.reports = this.reports.filter(report => report.id !== reportId);
    // Update localStorage for persistence in demo
    localStorage.setItem('userReports', JSON.stringify(this.reports));
  }
  
  public getBannedWords(): string[] {
    return this.bannedWords;
  }
  
  public setBannedWords(words: string[]): void {
    this.bannedWords = words;
    // Store in localStorage for persistence in demo
    localStorage.setItem('bannedWords', JSON.stringify(words));
  }
}

export const signalRService = new SignalRService();
