
import * as signalR from '@microsoft/signalr';
import { toast } from "sonner";
import { MockHubConnection } from './signalR/mockConnection';
import { ChatMessage, ConnectionStatus, ISignalRService } from './signalR/types';

export type { ChatMessage } from './signalR/types';

class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private connectionStatusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private connectedUsersCallbacks: ((count: number) => void)[] = [];
  private blockedUsers: Set<number> = new Set();
  private chatHistory: Record<number, ChatMessage[]> = {};

  public async initialize(userId: number, username: string): Promise<void> {
    this.connectionStatus = 'connecting';
    this.notifyConnectionStatusChanged();

    await new Promise(resolve => setTimeout(resolve, 1000));

    this.connection = new MockHubConnection() as unknown as signalR.HubConnection;
    this.connectionStatus = 'connected';
    this.notifyConnectionStatusChanged();
    
    this.updateConnectedUsersCount();
    
    this.connection.on('receiveMessage', (message: ChatMessage) => {
      // Don't receive messages from blocked users
      if (this.blockedUsers.has(message.senderId)) {
        return;
      }
      
      // Store message in chat history
      if (!this.chatHistory[message.senderId]) {
        this.chatHistory[message.senderId] = [];
      }
      this.chatHistory[message.senderId].push(message);
      
      this.messageCallbacks.forEach(callback => callback(message));
    });

    toast.success("Connected to chat server!");
  }

  public onMessageReceived(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void) {
    this.connectionStatusCallbacks.push(callback);
    callback(this.connectionStatus);
  }

  public onConnectedUsersCountChanged(callback: (count: number) => void) {
    this.connectedUsersCallbacks.push(callback);
  }

  private notifyConnectionStatusChanged() {
    this.connectionStatusCallbacks.forEach(callback => callback(this.connectionStatus));
  }

  public async sendMessage(recipientId: number, content: string): Promise<void> {
    if (!this.connection || this.connectionStatus !== 'connected') {
      toast.error("Not connected to chat server!");
      return;
    }
    
    if (this.blockedUsers.has(recipientId)) {
      toast.error("You have blocked this user.");
      return;
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      content,
      sender: 'You',
      senderId: 0,
      timestamp: new Date()
    };
    
    // Store message in chat history
    if (!this.chatHistory[recipientId]) {
      this.chatHistory[recipientId] = [];
    }
    this.chatHistory[recipientId].push(message);
    
    this.simulateMessageSent(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = true): Promise<void> {
    if (!this.connection || this.connectionStatus !== 'connected') {
      toast.error("Not connected to chat server!");
      return;
    }
    
    if (this.blockedUsers.has(recipientId)) {
      toast.error("You have blocked this user.");
      return;
    }

    const message: ChatMessage = {
      id: `img_${Date.now()}`,
      content: 'Image',
      sender: 'You',
      senderId: 0,
      timestamp: new Date(),
      isImage: true,
      imageUrl,
      isBlurred
    };

    // Store message in chat history
    if (!this.chatHistory[recipientId]) {
      this.chatHistory[recipientId] = [];
    }
    this.chatHistory[recipientId].push(message);
    
    this.simulateMessageSent(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatusChanged();
    }
  }

  public blockUser(userId: number): void {
    this.blockedUsers.add(userId);
  }
  
  public unblockUser(userId: number): void {
    this.blockedUsers.delete(userId);
  }
  
  public isUserBlocked(userId: number): boolean {
    return this.blockedUsers.has(userId);
  }
  
  public getBlockedUsers(): number[] {
    return Array.from(this.blockedUsers);
  }
  
  public getChatHistory(userId: number): ChatMessage[] {
    return this.chatHistory[userId] || [];
  }
  
  public getAllChatHistory(): Record<number, ChatMessage[]> {
    return this.chatHistory;
  }

  public simulateReceiveMessage(fromUserId: number, username: string, content: string, isImage = false, imageUrl = '', isBlurred = false) {
    // If user is blocked, don't simulate receiving a message
    if (this.blockedUsers.has(fromUserId)) {
      return;
    }
    
    // Add a realistic delay for bot responses (5-10 seconds)
    const realisticDelay = 5000 + Math.random() * 5000;
    
    setTimeout(() => {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        content,
        sender: username,
        senderId: fromUserId,
        timestamp: new Date(),
        isImage,
        imageUrl,
        isBlurred
      };
      
      // Store in chat history
      if (!this.chatHistory[fromUserId]) {
        this.chatHistory[fromUserId] = [];
      }
      this.chatHistory[fromUserId].push(message);
      
      this.messageCallbacks.forEach(callback => callback(message));
    }, realisticDelay);
  }

  private simulateMessageSent(message: ChatMessage) {
    // Only respond if the message is from the user (not from a bot)
    if (Math.random() > 0.4) {
      this.simulateReceiveMessage(
        1,
        "Alice",
        "Thanks for your message! How are you doing today?",
        false,
        ""
      );
    }
  }

  private updateConnectedUsersCount() {
    setInterval(() => {
      const count = 5 + Math.floor(Math.random() * 11);
      this.connectedUsersCallbacks.forEach(callback => callback(count));
    }, 5000);
  }
}

export const signalRService = new SignalRService();
