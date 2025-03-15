
import { MockHubConnection } from './mockConnection';
import { ConnectionStatus } from './types';

// Connection handling functionality
export const connectionService = {
  connection: null as any,
  userId: null as number | null,
  username: null as string | null,
  connectedUsersCount: 0,
  
  async initialize(userId: number, username: string): Promise<void> {
    this.userId = userId;
    this.username = username;
    
    this.connection = new MockHubConnection();
    this.connectedUsersCount = Math.floor(Math.random() * 100) + 50; // Random number of users for mock
    
    console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
    return Promise.resolve();
  },
  
  async disconnect(): Promise<void> {
    if (this.connection) {
      this.connection = null;
      this.userId = null;
      this.username = null;
      console.log('SignalR disconnected');
    }
    return Promise.resolve();
  },
  
  onConnectedUsersCountChanged(callback: (count: number) => void): void {
    // For mock purposes, just return the stored count
    callback(this.connectedUsersCount);
  },
  
  onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): void {
    callback('connected'); // Always connected in mock
  },
  
  get currentUserId(): number {
    return this.userId || 0;
  },
  
  get currentUsername(): string | null {
    return this.username;
  },
  
  isAdminUser(userId: number): boolean {
    // Admin users have a special ID range (e.g., 999 as defined in useSignalRConnection.ts)
    return userId === 999;
  }
}
