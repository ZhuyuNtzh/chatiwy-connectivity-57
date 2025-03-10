
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
  private userName: string = '';
  private isInitializing: boolean = false;

  public async initialize(userId: number, username: string): Promise<void> {
    // Store the username for later use
    this.userName = username;
    
    // Only initialize if not already connected or initializing
    if (this.connectionStatus === 'connected' || this.isInitializing) {
      return;
    }
    
    this.isInitializing = true;
    this.connectionStatus = 'connecting';
    this.notifyConnectionStatusChanged();

    try {
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
    } catch (error) {
      console.error("Error connecting to chat server:", error);
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatusChanged();
      toast.error("Failed to connect to chat server. Please try again.");
    } finally {
      this.isInitializing = false;
    }
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
    // Ensure connection is active
    if (this.connectionStatus !== 'connected') {
      await this.reconnectIfNeeded();
    }
    
    if (this.connectionStatus !== 'connected') {
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
    
    this.simulateMessageSent(message, recipientId);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = true): Promise<void> {
    // Ensure connection is active
    if (this.connectionStatus !== 'connected') {
      await this.reconnectIfNeeded();
    }
    
    if (this.connectionStatus !== 'connected') {
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
    
    this.simulateMessageSent(message, recipientId);
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private async reconnectIfNeeded(): Promise<void> {
    if (this.connectionStatus === 'disconnected' && !this.isInitializing && this.userName) {
      console.log("Attempting to reconnect...");
      await this.initialize(1, this.userName);
    }
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
    // Filter out empty histories
    const filteredHistory: Record<number, ChatMessage[]> = {};
    
    Object.entries(this.chatHistory).forEach(([userId, messages]) => {
      if (messages.length > 0) {
        filteredHistory[parseInt(userId)] = messages;
      }
    });
    
    return filteredHistory;
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

  private simulateMessageSent(message: ChatMessage, recipientId: number) {
    // Only respond if the message is from the user (not from a bot)
    // And don't auto-respond with a random message - make it contextual
    
    const mockUser = this.getMockUserById(recipientId);
    if (!mockUser) return;
    
    const responseOptions = this.getContextualResponses(message, mockUser);
    
    if (responseOptions.length > 0) {
      const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
      
      this.simulateReceiveMessage(
        recipientId,
        mockUser.username,
        randomResponse,
        false,
        "",
        false
      );
    }
  }
  
  private getMockUserById(userId: number) {
    // Mock user data - this would come from a real database in production
    const mockUsers = [
      { id: 1, username: "Alice", interests: ["Art", "Photography", "Travel"] },
      { id: 2, username: "Bob", interests: ["Music", "Technology", "Gaming"] },
      { id: 3, username: "Clara", interests: ["Fashion", "Cooking", "Sports"] },
      { id: 4, username: "David", interests: ["Cooking", "Books", "Music"] },
      { id: 5, username: "Elena", interests: ["Sports", "Fashion", "Fitness"] },
      { id: 11, username: "TravelBot", interests: ["Travel", "Photography", "Food"] },
      { id: 12, username: "FitnessGuru", interests: ["Fitness", "Cooking", "Health"] },
      { id: 13, username: "BookWorm", interests: ["Books", "Writing", "Movies"] },
      { id: 14, username: "TechGeek", interests: ["Technology", "Gaming", "Music"] },
      { id: 15, username: "ArtLover", interests: ["Art", "Photography", "Fashion"] }
    ];
    
    return mockUsers.find(user => user.id === userId);
  }
  
  private getContextualResponses(message: ChatMessage, user: {id: number, username: string, interests: string[]}) {
    // Simple contextual responses based on message content and user interests
    const content = message.content.toLowerCase();
    const responses: string[] = [];
    
    // Image responses
    if (message.isImage) {
      return [
        "Thanks for sharing the image!",
        "Nice picture, thanks for sharing!",
        "That's an interesting image.",
        `As someone interested in ${user.interests[0]}, I appreciate this visual.`,
        "I like your photo. Would you like to share more?",
      ];
    }
    
    // Greeting responses
    if (content.includes('hi') || content.includes('hello') || content.includes('hey')) {
      responses.push(
        `Hi ${this.userName}! How are you doing today?`,
        `Hello there! Nice to meet you, ${this.userName}.`,
        `Hey ${this.userName}! How's your day going?`
      );
    }
    
    // Interest-based responses
    user.interests.forEach(interest => {
      if (content.includes(interest.toLowerCase())) {
        responses.push(
          `I'm really passionate about ${interest} too! What aspects do you enjoy most?`,
          `${interest} is one of my favorite topics! I'd love to hear more about your interest in it.`,
          `It's great to meet someone else interested in ${interest}!`
        );
      }
    });
    
    // Question responses
    if (content.includes('?')) {
      responses.push(
        "That's an interesting question. Let me think about it...",
        "Good question! I'd need to consider that carefully.",
        "I'm not sure I have a definitive answer to that, but I'd like to discuss it more."
      );
    }
    
    // Default responses if nothing specific was detected
    if (responses.length === 0) {
      responses.push(
        `That's interesting! Tell me more about yourself.`,
        `I see. By the way, I'm really into ${user.interests.join(', ')}. What about you?`,
        `Thanks for sharing. What else would you like to talk about?`,
        `I appreciate your message. Would you like to hear about my interest in ${user.interests[0]}?`
      );
    }
    
    return responses;
  }

  private updateConnectedUsersCount() {
    // Start with a stable number for better UX
    const baseCount = 12;
    
    // Immediately notify with initial count
    this.connectedUsersCallbacks.forEach(callback => callback(baseCount));
    
    // Then update periodically with slight variations
    setInterval(() => {
      // Vary by -2 to +2 from base count, never below 5
      const variation = Math.floor(Math.random() * 5) - 2;
      const count = Math.max(5, baseCount + variation);
      this.connectedUsersCallbacks.forEach(callback => callback(count));
    }, 30000); // Update every 30 seconds for a more stable count
  }
}

export const signalRService = new SignalRService();
