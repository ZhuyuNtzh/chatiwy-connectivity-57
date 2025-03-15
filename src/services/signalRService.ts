import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ISignalRService, ChatMessage, ConnectionStatus, UserReport } from './signalR/types';
import { MockHubConnection } from './signalR/mockConnection';

// This is using the mock connection for now, but can be replaced with a real connection
class SignalRService implements ISignalRService {
  private connection: any = null;
  private userId: number | null = null;
  private username: string | null = null;
  private bannedWords: string[] = [];
  private connectedUsersCount = 0;
  private blockedUsers: number[] = [];
  private chatHistory: Record<number, ChatMessage[]> = {};
  private reports: UserReport[] = [];
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((userId: number) => void)[] = [];
  private deleteCallbacks: ((messageId: string) => void)[] = [];
  
  public get currentUserId(): number {
    return this.userId || 0;
  }

  public async initialize(userId: number, username: string): Promise<void> {
    this.userId = userId;
    this.username = username;
    
    // Load banned words from localStorage if available
    const savedBannedWords = localStorage.getItem('bannedWords');
    if (savedBannedWords) {
      try {
        this.bannedWords = JSON.parse(savedBannedWords);
      } catch (e) {
        console.error('Error parsing banned words:', e);
        this.bannedWords = [];
      }
    }
    
    // Load blocked users from localStorage
    const savedBlockedUsers = localStorage.getItem('blockedUsers');
    if (savedBlockedUsers) {
      try {
        this.blockedUsers = JSON.parse(savedBlockedUsers);
      } catch (e) {
        console.error('Error parsing blocked users:', e);
        this.blockedUsers = [];
      }
    }
    
    // Load chat history from localStorage
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        this.chatHistory = JSON.parse(savedChatHistory);
      } catch (e) {
        console.error('Error parsing chat history:', e);
        this.chatHistory = {};
      }
    }
    
    // Load reports from localStorage
    const savedReports = localStorage.getItem('reports');
    if (savedReports) {
      try {
        this.reports = JSON.parse(savedReports);
      } catch (e) {
        console.error('Error parsing reports:', e);
        this.reports = [];
      }
    }
    
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
  public async sendMessage(recipientId: number, content: string, actualUsername?: string): Promise<void> {
    if (this.isUserBlocked(recipientId)) {
      console.log(`Cannot send message to blocked user ${recipientId}`);
      return Promise.resolve();
    }
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: this.username || 'You',
      actualUsername: actualUsername || this.username,
      senderId: this.userId || 0,
      recipientId,
      timestamp: new Date(),
      status: 'sent'
    };
    
    // Add to chat history
    if (!this.chatHistory[recipientId]) {
      this.chatHistory[recipientId] = [];
    }
    this.chatHistory[recipientId].push(newMessage);
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    
    // Simulate a response
    setTimeout(() => {
      this.simulateReceivedMessage(recipientId, actualUsername);
    }, 1000 + Math.random() * 2000);
    
    return Promise.resolve();
  }
  
  public async sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<void> {
    if (this.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    const newMessage: ChatMessage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: this.username || 'You',
      senderId: this.userId || 0,
      recipientId,
      timestamp: new Date(),
      isImage: true,
      imageUrl,
      isBlurred,
      status: 'sent'
    };
    
    // Add to chat history
    if (!this.chatHistory[recipientId]) {
      this.chatHistory[recipientId] = [];
    }
    this.chatHistory[recipientId].push(newMessage);
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    
    return Promise.resolve();
  }
  
  public async sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void> {
    if (this.isUserBlocked(recipientId)) {
      return Promise.resolve();
    }
    
    const newMessage: ChatMessage = {
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: this.username || 'You',
      senderId: this.userId || 0,
      recipientId,
      timestamp: new Date(),
      isVoiceMessage: true,
      audioUrl,
      status: 'sent'
    };
    
    // Add to chat history
    if (!this.chatHistory[recipientId]) {
      this.chatHistory[recipientId] = [];
    }
    this.chatHistory[recipientId].push(newMessage);
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    
    return Promise.resolve();
  }
  
  public async deleteMessage(messageId: string, recipientId: number): Promise<void> {
    // Update chat history
    if (this.chatHistory[recipientId]) {
      this.chatHistory[recipientId] = this.chatHistory[recipientId].map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      );
      
      // Save to localStorage
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
      
      // Notify listeners
      this.deleteCallbacks.forEach(callback => callback(messageId));
    }
    
    return Promise.resolve();
  }
  
  public sendTypingIndication(recipientId: number): void {
    // Notify typing listeners
    this.typingCallbacks.forEach(callback => callback(recipientId));
  }
  
  // User blocking
  public blockUser(userId: number): void {
    if (!this.blockedUsers.includes(userId)) {
      this.blockedUsers.push(userId);
      localStorage.setItem('blockedUsers', JSON.stringify(this.blockedUsers));
    }
  }
  
  public unblockUser(userId: number): void {
    this.blockedUsers = this.blockedUsers.filter(id => id !== userId);
    localStorage.setItem('blockedUsers', JSON.stringify(this.blockedUsers));
  }
  
  public isUserBlocked(userId: number): boolean {
    return this.blockedUsers.includes(userId);
  }
  
  public isAdminUser(userId: number): boolean {
    // Admin users have a special ID range (e.g., 999 as defined in useSignalRConnection.ts)
    return userId === 999;
  }
  
  public getBlockedUsers(): number[] {
    return [...this.blockedUsers];
  }
  
  // Chat history management
  public getChatHistory(userId: number): ChatMessage[] {
    return this.chatHistory[userId] || [];
  }
  
  public getAllChatHistory(): Record<number, ChatMessage[]> {
    return { ...this.chatHistory };
  }
  
  public clearAllChatHistory(): void {
    this.chatHistory = {};
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
  }
  
  // Banned words management
  public getBannedWords(): string[] {
    return [...this.bannedWords];
  }
  
  public addBannedWord(word: string): void {
    if (!this.bannedWords.includes(word.toLowerCase())) {
      this.bannedWords.push(word.toLowerCase());
      // Save to localStorage
      localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
    }
  }
  
  public removeBannedWord(word: string): void {
    this.bannedWords = this.bannedWords.filter(w => w !== word.toLowerCase());
    // Save to localStorage
    localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
  }
  
  public setBannedWords(words: string[]): void {
    this.bannedWords = words.map(word => word.toLowerCase());
    // Save to localStorage
    localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
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
    const newReport: UserReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporterId,
      reporterName,
      reportedId,
      reportedName,
      reason,
      details,
      timestamp: new Date(),
      status: 'pending'
    };
    
    this.reports.push(newReport);
    
    // Save to localStorage
    localStorage.setItem('reports', JSON.stringify(this.reports));
    console.log('Report submitted:', newReport);
  }
  
  public getReports(): UserReport[] {
    // Filter out reports older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.reports = this.reports.filter(report => new Date(report.timestamp) > twentyFourHoursAgo);
    
    // Save updated reports to localStorage
    localStorage.setItem('reports', JSON.stringify(this.reports));
    
    return [...this.reports];
  }
  
  public deleteReport(reportId: string): void {
    this.reports = this.reports.filter(report => report.id !== reportId);
    localStorage.setItem('reports', JSON.stringify(this.reports));
  }
  
  // Helper method to simulate received messages
  private simulateReceivedMessage(senderId: number, actualUsername?: string): void {
    // Skip for blocked users
    if (this.isUserBlocked(senderId)) {
      return;
    }
    
    // Get a random response
    const responses = [
      "Hi there! How are you?",
      "Nice to meet you!",
      "What are you up to today?",
      "That's interesting!",
      "Tell me more about yourself.",
      "I'm having a great day so far.",
      "Do you have any hobbies?",
      "Have you traveled anywhere interesting recently?",
      "What movies do you enjoy watching?",
      "I like your style!"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const senderName = `User${senderId}`;
    const recipientUsername = actualUsername || this.username || 'You';
    
    const newMessage: ChatMessage = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: randomResponse,
      sender: senderName,
      actualUsername: recipientUsername,
      senderId: senderId,
      recipientId: this.userId || 0,
      timestamp: new Date(),
      status: 'delivered'
    };
    
    // Add to chat history
    if (!this.chatHistory[senderId]) {
      this.chatHistory[senderId] = [];
    }
    this.chatHistory[senderId].push(newMessage);
    
    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    
    // Notify message listeners
    this.messageCallbacks.forEach(callback => callback(newMessage));
  }
}

export const signalRService = new SignalRService();
