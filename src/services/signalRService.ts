import * as signalR from '@microsoft/signalr';
import { toast } from "sonner";
import { MockHubConnection } from './signalR/mockConnection';
import { ChatMessage, ConnectionStatus, ISignalRService } from './signalR/types';

export { ChatMessage } from './signalR/types';

class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private connectionStatusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private connectedUsersCallbacks: ((count: number) => void)[] = [];

  public async initialize(userId: number, username: string): Promise<void> {
    this.connectionStatus = 'connecting';
    this.notifyConnectionStatusChanged();

    await new Promise(resolve => setTimeout(resolve, 1000));

    this.connection = new MockHubConnection() as unknown as signalR.HubConnection;
    this.connectionStatus = 'connected';
    this.notifyConnectionStatusChanged();
    
    this.updateConnectedUsersCount();
    
    this.connection.on('receiveMessage', (message: ChatMessage) => {
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

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      content,
      sender: 'You',
      senderId: 0,
      timestamp: new Date()
    };
    
    this.simulateMessageSent(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  public async sendImage(recipientId: number, imageUrl: string): Promise<void> {
    if (!this.connection || this.connectionStatus !== 'connected') {
      toast.error("Not connected to chat server!");
      return;
    }

    const message: ChatMessage = {
      id: `img_${Date.now()}`,
      content: 'Image',
      sender: 'You',
      senderId: 0,
      timestamp: new Date(),
      isImage: true,
      imageUrl
    };

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

  public simulateReceiveMessage(fromUserId: number, username: string, content: string, isImage = false, imageUrl = '') {
    setTimeout(() => {
      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        content,
        sender: username,
        senderId: fromUserId,
        timestamp: new Date(),
        isImage,
        imageUrl
      };
      this.messageCallbacks.forEach(callback => callback(message));
    }, 1000 + Math.random() * 2000);
  }

  private simulateMessageSent(message: ChatMessage) {
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
