import * as signalR from '@microsoft/signalr';
import { ChatMessage } from './signalR/types';
import { chatStorage } from './signalR/chatStorage';

class SignalRService {
  private connection: any = null;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private messageHandlers: ((message: any) => void)[] = [];
  private typingHandlers: ((userId: number) => void)[] = [];
  private messageDeletedHandlers: ((messageId: string) => void)[] = [];
  
  // Add this property to track the currently selected user in the chat
  public selectedUserId: number | null = null;

  public currentUserId: number | null = null;

  constructor() {
    chatStorage.loadFromStorage();
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

  public async sendMessage(userId: number, messageText: string, username: string): Promise<void> {
    try {
      await this.connection.invoke('SendMessage', userId, messageText, username);
    } catch (err) {
      console.error('Error sending message: ', err);
    }
  }

  public async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.connection.invoke('DeleteMessage', messageId);
    } catch (err) {
      console.error('Error deleting message: ', err);
    }
  }

  public async sendTyping(userId: number): Promise<void> {
    try {
      await this.connection.invoke('SendTyping', userId);
    } catch (err) {
      console.error('Error sending typing signal: ', err);
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

  public markMessagesAsRead(senderId: number, recipientId: number): void {
    chatStorage.markMessagesAsRead(this.currentUserId || 0, senderId, recipientId);
  }

  public clearUserSession(): void {
    chatStorage.clearUserSession(this.currentUserId || 0);
  }

  public async blockUser(targetUserId: number): Promise<void> {
    try {
      await this.connection.invoke('BlockUser', targetUserId);
    } catch (err) {
      console.error('Error blocking user: ', err);
    }
  }

  public async unblockUser(targetUserId: number): Promise<void> {
    try {
      await this.connection.invoke('UnblockUser', targetUserId);
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
      // Assuming there's a method to get blocked users from the server
      // Adjust the method name if it's different
      return this.connection.invoke('GetBlockedUsers') || [];
    } catch (error) {
      console.error('Failed to get blocked users:', error);
      return [];
    }
  }

  public async reportUser(targetUserId: number, reason: string, otherReason: string): Promise<void> {
    try {
      await this.connection.invoke('ReportUser', targetUserId, reason, otherReason);
    } catch (err) {
      console.error('Error reporting user: ', err);
    }
  }
}

export const signalRService = new SignalRService();
