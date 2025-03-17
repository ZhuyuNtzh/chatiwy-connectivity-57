import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { ChatMessage, UserReport, TypingIndicator, UserSession } from './signalR/types';
import { messageHandler, handleIncomingMessage } from './signalR/messageHandler';
import { isUserBlocked, blockUser, unblockUser, getBlockedUsers } from './signalR/userBlocking';
import { reportUser, getReports, deleteReport, addReport } from './signalR/userReporting';
import createMockConnection from './signalR/mockConnection';
import { createChatManagementService } from './signalR/chatManagement';
import { createEventHandlers } from './signalR/eventHandlers';

// Mock data for testing
const mockBannedWords = ['badword', 'offensive', 'inappropriate', 'slur'];

class SignalRService {
  private connection: HubConnection | null = null;
  private _currentUserId: number = 0;
  private _currentUsername: string = '';
  private _sessionToken: string = '';
  private _userRole: 'standard' | 'vip' | 'admin' = 'standard';
  private typingUsers: Record<number, TypingIndicator> = {};
  private mockReports: UserReport[] = [];
  private userSession: UserSession | null = null;
  currentSelectedUserId: number | null = null;
  
  // Initialize the chat management service
  private chatManagement = createChatManagementService(
    () => this._currentUserId,
    () => this._currentUsername, 
    () => this.getBannedWords()
  );
  
  // Initialize event handlers
  private eventHandlers = createEventHandlers();
  
  constructor() {
    this.initialize();
  }
  
  // Changed to public so it can be called externally
  public initialize(userId?: number, username?: string) {
    // Try to load user session if available
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      try {
        this.userSession = JSON.parse(savedSession);
        this._currentUserId = this.userSession.userId;
        this._currentUsername = this.userSession.username;
        this._userRole = this.userSession.role;
        this._sessionToken = this.userSession.sessionToken;
      } catch (error) {
        console.error('Error parsing user session:', error);
        this.resetSession();
      }
    }
    
    // If userId and username are provided, update the current session
    if (userId !== undefined && username !== undefined) {
      this._currentUserId = userId;
      this._currentUsername = username;
      this.startConnection(userId, username, this._userRole);
    }
  }
  
  // Reset user session
  private resetSession() {
    this._currentUserId = 0;
    this._currentUsername = '';
    this._sessionToken = '';
    this._userRole = 'standard';
    this.userSession = null;
    localStorage.removeItem('userSession');
  }
  
  // Start a connection with the specified user details
  async startConnection(userId: number, username: string, userRole: 'standard' | 'vip' | 'admin' = 'standard') {
    // Save current user information
    this._currentUserId = userId;
    this._currentUsername = username;
    this._userRole = userRole;
    
    // Generate session token
    this._sessionToken = this.generateSessionToken();
    
    // Save user session
    this.userSession = {
      userId,
      username,
      role: userRole,
      sessionToken: this._sessionToken
    };
    
    // Save to localStorage
    localStorage.setItem('userSession', JSON.stringify(this.userSession));
    
    // In a real app, we would connect to SignalR here
    // For mock implementation, we use the mock connection
    this.connection = createMockConnection();
    
    console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
    
    return true;
  }
  
  // Check if user is an admin
  public isAdminUser(): boolean {
    return this._userRole === 'admin';
  }
  
  // Disconnect
  disconnect() {
    if (this.connection) {
      // In a real app, we would disconnect from SignalR here
      this.connection = null;
      console.log('SignalR disconnected');
    }
    
    // Reset the session
    this.resetSession();
  }
  
  // Generate a unique session token
  private generateSessionToken(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${randomStr}_${this._currentUserId}`;
  }
  
  // Getters for current user info
  get currentUserId(): number {
    return this._currentUserId;
  }
  
  get currentUsername(): string {
    return this._currentUsername;
  }
  
  get userRole(): 'standard' | 'vip' | 'admin' {
    return this._userRole;
  }
  
  // Update user role (used when admin upgrades a user)
  updateUserRole(role: 'standard' | 'vip' | 'admin') {
    this._userRole = role;
    
    if (this.userSession) {
      this.userSession.role = role;
      localStorage.setItem('userSession', JSON.stringify(this.userSession));
    }
  }
  
  // Event handling methods (delegated to eventHandlers)
  public onMessageReceived(callback: (message: ChatMessage) => void) {
    this.eventHandlers.onMessageReceived(callback);
  }
  
  public offMessageReceived(callback: (message: ChatMessage) => void) {
    this.eventHandlers.offMessageReceived(callback);
  }
  
  public onUserTyping(callback: (userId: number) => void) {
    this.eventHandlers.onUserTyping(callback);
  }
  
  public offUserTyping(callback: (userId: number) => void) {
    this.eventHandlers.offUserTyping(callback);
  }
  
  public onMessageDeleted(callback: (messageId: string) => void) {
    this.eventHandlers.onMessageDeleted(callback);
  }
  
  public offMessageDeleted(callback: (messageId: string) => void) {
    this.eventHandlers.offMessageDeleted(callback);
  }
  
  public onConnectedUsersCountChanged(callback: (count: number) => void) {
    this.eventHandlers.onConnectedUsersCountChanged(callback);
  }
  
  // Message handling methods (delegated to chatManagement)
  public sendMessage(
    recipientId: number, 
    content: string,
    attachments?: any[],
    replyToId?: string,
    replyText?: string
  ): Promise<boolean> {
    const result = this.chatManagement.sendMessage(recipientId, content, attachments, replyToId, replyText);
    
    // Simulate receiving a reply after a short delay
    if (recipientId < 100) { // Only auto-reply for mock users
      setTimeout(() => {
        this.simulateReply(recipientId, this._currentUserId, replyToId);
      }, 1000 + Math.random() * 2000);
    }
    
    return result;
  }
  
  public sendImage(recipientId: number, imageUrl: string, isBlurred: boolean = false): Promise<boolean> {
    return this.chatManagement.sendImage(recipientId, imageUrl, isBlurred);
  }
  
  public sendVoiceMessage(recipientId: number, audioUrl: string): Promise<boolean> {
    return this.chatManagement.sendVoiceMessage(recipientId, audioUrl);
  }
  
  public getChatHistory(userId: number): ChatMessage[] {
    return this.chatManagement.getChatHistoryForUser(userId);
  }
  
  public getAllChatHistory(): Record<number, ChatMessage[]> {
    return this.chatManagement.getAllChatHistory();
  }
  
  public async clearAllChatHistory(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const localStorageKeys = Object.keys(localStorage);
        localStorageKeys.forEach(key => {
          if (key.startsWith('chat_') || key.startsWith('history_')) {
            localStorage.removeItem(key);
          }
        });
        
        this.chatManagement.clearAllChatHistory();
        
        resolve();
      }, 0);
    });
  }
  
  public markMessagesAsRead(userId: number): boolean {
    return this.chatManagement.markMessagesAsReadForUser(userId);
  }
  
  public deleteMessage(messageId: string, recipientId: number): Promise<boolean> {
    return this.chatManagement.deleteMessage(messageId, recipientId);
  }
  
  // Simulate receiving a reply from another user
  private simulateReply(senderId: number, recipientId: number, replyToId?: string) {
    // Generate a reply based on the type of bot
    const replies: Record<number, string[]> = {
      1: [
        "Hi there! How are you doing today?",
        "Nice to meet you!",
        "What's up?",
        "Hello! What brings you here today?",
        "Hey! How's your day going?"
      ],
      2: [
        "Have you traveled anywhere interesting recently?",
        "I'm planning a trip next month. Any recommendations?",
        "Do you enjoy outdoor activities?",
        "What's your favorite hobby?",
        "I've been trying to learn a new language. Do you speak any foreign languages?"
      ],
      11: [
        "Paris is beautiful in the spring! Have you ever been?",
        "The food in Japan is absolutely amazing. What's your favorite cuisine?",
        "Hiking in the Alps was one of my best experiences. Do you like hiking?",
        "Beach or mountains? I can't decide which I prefer more for vacations.",
        "Travel tip: always pack lighter than you think you need to!"
      ],
      12: [
        "Have you tried high-intensity interval training? It's great for burning calories!",
        "Staying hydrated is so important during workouts. Do you drink enough water?",
        "What's your favorite form of exercise?",
        "I find morning workouts give me energy for the whole day. When do you prefer to exercise?",
        "Balance is key - both in fitness and nutrition!"
      ],
      13: [
        "Have you read any good books lately?",
        "I just finished a fascinating novel about time travel. Do you enjoy science fiction?",
        "What genre of books do you enjoy the most?",
        "Physical books or e-readers? I'm torn between convenience and the feel of paper.",
        "I think reading before bed helps me sleep better. Do you read at night?"
      ]
    };
    
    // If there are no specific replies for this sender, use generic ones
    const senderReplies = replies[senderId] || replies[1];
    
    // Pick a random reply
    const randomReply = senderReplies[Math.floor(Math.random() * senderReplies.length)];
    
    // Create a unique message ID with "reply_" prefix
    const messageId = `reply_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Determine sender username based on ID
    const senderNames: Record<number, string> = {
      1: "Alice",
      2: "Bob",
      3: "Clara",
      4: "David",
      5: "Elena",
      6: "Frank",
      7: "Gina",
      8: "Henry",
      9: "Irene",
      10: "Jack",
      11: "TravelBot",
      12: "FitnessGuru",
      13: "BookWorm"
    };
    
    const senderName = senderNames[senderId] || `User${senderId}`;
    
    // Create message object for the reply
    const replyMessage: ChatMessage = {
      id: messageId,
      content: randomReply,
      sender: senderName,
      actualUsername: senderName,
      senderId: senderId,
      recipientId: recipientId,
      timestamp: new Date(),
      status: 'delivered',
      isRead: false,
      replyToId: replyToId
    };
    
    // Store the reply in chat history
    this.chatManagement.sendMessage(
      recipientId, 
      randomReply, 
      undefined, 
      replyToId, 
      replyToId ? "Previous message" : undefined
    );
    
    // In a real app, this would be handled by the SignalR hub
    // For the mock version, we directly call the handler
    handleIncomingMessage(replyMessage);
  }
  
  // Set typing indicator
  setTypingIndicator(isTyping: boolean, recipientId: number): void {
    this.eventHandlers.setTypingIndicator(isTyping, recipientId, this._currentUserId, this._currentUsername);
  }
  
  // User blocking methods
  isUserBlocked(userId: number): boolean {
    return isUserBlocked(this._currentUserId, userId);
  }
  
  blockUser(userId: number): boolean {
    return blockUser(this._currentUserId, userId);
  }
  
  unblockUser(userId: number): boolean {
    return unblockUser(this._currentUserId, userId);
  }
  
  // Get all blocked users for the current user
  getBlockedUsers(): number[] {
    return getBlockedUsers(this._currentUserId);
  }
  
  // User reporting methods
  reportUser(reportedUserId: number, reportedUsername: string, reason: string, details?: string): boolean {
    return reportUser(this._currentUserId, this._currentUsername, reportedUserId, reportedUsername, reason, details);
  }
  
  getReports(): UserReport[] {
    return getReports();
  }
  
  deleteReport(reportId: string): boolean {
    return deleteReport(reportId);
  }
  
  addReport(report: UserReport): boolean {
    return addReport(report);
  }
  
  // Content moderation methods
  getBannedWords(): string[] {
    try {
      const storedWords = localStorage.getItem('bannedWords');
      if (storedWords) {
        return JSON.parse(storedWords);
      }
    } catch (error) {
      console.error('Error loading banned words:', error);
    }
    
    return mockBannedWords;
  }
  
  setBannedWords(words: string[]): boolean {
    try {
      localStorage.setItem('bannedWords', JSON.stringify(words));
      return true;
    } catch (error) {
      console.error('Error saving banned words:', error);
      return false;
    }
  }
  
  // Get auth token
  getAuthToken(): string {
    return this._sessionToken;
  }
}

// Create a singleton instance
export const signalRService = new SignalRService();
