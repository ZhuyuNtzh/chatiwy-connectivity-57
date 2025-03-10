
import * as signalR from '@microsoft/signalr';
import { toast } from "sonner";

// Message types
export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  senderId: number;
  timestamp: Date;
  isImage?: boolean;
  imageUrl?: string;
  senderRole?: string;
}

// Connection status
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private connectionStatusCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private connectedUsersCallbacks: ((count: number) => void)[] = [];

  // Initialize SignalR connection
  public async initialize(userId: number, username: string): Promise<void> {
    // For demo purposes, we'll simulate a connection without an actual server
    this.connectionStatus = 'connecting';
    this.notifyConnectionStatusChanged();

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a mock connection for demonstration
    this.connection = new MockHubConnection();
    this.connectionStatus = 'connected';
    this.notifyConnectionStatusChanged();
    
    // Simulate connected users count update
    this.updateConnectedUsersCount();
    
    // Set up message handler
    this.connection.on('receiveMessage', (message: ChatMessage) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });

    toast.success("Connected to chat server!");
  }

  // Register callback for receiving messages
  public onMessageReceived(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  // Register callback for connection status changes
  public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void) {
    this.connectionStatusCallbacks.push(callback);
    // Immediately notify with current status
    callback(this.connectionStatus);
  }

  // Register callback for connected users count
  public onConnectedUsersCountChanged(callback: (count: number) => void) {
    this.connectedUsersCallbacks.push(callback);
  }

  // Notify all connection status callbacks
  private notifyConnectionStatusChanged() {
    this.connectionStatusCallbacks.forEach(callback => callback(this.connectionStatus));
  }

  // Send a message to a user
  public async sendMessage(recipientId: number, content: string): Promise<void> {
    if (!this.connection || this.connectionStatus !== 'connected') {
      toast.error("Not connected to chat server!");
      return;
    }

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      content,
      sender: 'You',
      senderId: 0, // Current user
      timestamp: new Date()
    };

    // In a real app, we would invoke a method on the hub
    // await this.connection.invoke('SendMessage', recipientId, content);
    
    // For demo, simulate sending a message
    this.simulateMessageSent(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Send an image message
  public async sendImage(recipientId: number, imageUrl: string): Promise<void> {
    if (!this.connection || this.connectionStatus !== 'connected') {
      toast.error("Not connected to chat server!");
      return;
    }

    const message: ChatMessage = {
      id: `img_${Date.now()}`,
      content: 'Image',
      sender: 'You',
      senderId: 0, // Current user
      timestamp: new Date(),
      isImage: true,
      imageUrl
    };

    // For demo, simulate sending an image
    this.simulateMessageSent(message);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Disconnect from the hub
  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatusChanged();
    }
  }

  // For demo: simulate receiving a message
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
    }, 1000 + Math.random() * 2000); // Random delay for realism
  }

  // For demo: simulate message sent and possible reply
  private simulateMessageSent(message: ChatMessage) {
    // 60% chance of getting a reply
    if (Math.random() > 0.4) {
      this.simulateReceiveMessage(
        1, // simulate recipient id
        "Alice", // recipient name  
        "Thanks for your message! How are you doing today?",
        false,
        ""
      );
    }
  }

  // For demo: simulate connected users count
  private updateConnectedUsersCount() {
    setInterval(() => {
      // Random number between 5 and 15
      const count = 5 + Math.floor(Math.random() * 11);
      this.connectedUsersCallbacks.forEach(callback => callback(count));
    }, 5000); // Update every 5 seconds
  }
}

// Mock hub connection for demonstration without an actual server
class MockHubConnection implements signalR.HubConnection {
  private callbacks: Record<string, ((...args: any[]) => void)[]> = {};
  
  on(methodName: string, newMethod: (...args: any[]) => void): void {
    if (!this.callbacks[methodName]) {
      this.callbacks[methodName] = [];
    }
    this.callbacks[methodName].push(newMethod);
  }

  off(methodName: string, method: (...args: any[]) => void): void {
    if (!this.callbacks[methodName]) return;
    this.callbacks[methodName] = this.callbacks[methodName].filter(m => m !== method);
  }

  // Implementing the interface methods with empty implementations
  invoke<T = any>(methodName: string, ...args: any[]): Promise<T> {
    return Promise.resolve({} as T);
  }
  send(methodName: string, ...args: any[]): Promise<void> {
    return Promise.resolve();
  }
  start(transferFormat?: signalR.TransferFormat): Promise<void> {
    return Promise.resolve();
  }
  stop(): Promise<void> {
    return Promise.resolve();
  }
  onclose(callback: (error?: Error) => void): void {}
  onreconnecting(callback: (error?: Error) => void): void {}
  onreconnected(callback: (connectionId?: string) => void): void {}
  stream<T>(methodName: string, ...args: any[]): signalR.IStreamResult<T> {
    return { subscribe: () => ({ dispose: () => {} }) };
  }
  serverTimeoutInMilliseconds: number = 30000;
  keepAliveIntervalInMilliseconds: number = 15000;
  state: signalR.HubConnectionState = signalR.HubConnectionState.Connected;
  connectionId?: string;
  baseUrl: string = "";
}

// Export singleton instance
export const signalRService = new SignalRService();
