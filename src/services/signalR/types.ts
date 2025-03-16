
export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  actualUsername?: string;
  senderId: number;
  recipientId: number;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  isImage?: boolean;
  imageUrl?: string;
  isBlurred?: boolean;
  isVoiceMessage?: boolean;
  audioUrl?: string;
  isDeleted?: boolean;
  isBeingRepliedTo?: boolean;
  replyToId?: string;
  replyText?: string;
  translatedContent?: string;
  translatedLanguage?: string;
  isRead?: boolean;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface UserReport {
  id: string;
  reporterId: number;
  reporterName: string;
  reportedId: number;
  reportedName: string;
  reason: string;
  details?: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface ISignalRService {
  initialize(userId: number, username: string): Promise<void>;
  disconnect(): Promise<void>;
  
  // Connection status
  onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): void;
  onConnectedUsersCountChanged(callback: (count: number) => void): void;
  
  // Message handling
  onMessageReceived(callback: (message: ChatMessage) => void): void;
  offMessageReceived(callback: (message: ChatMessage) => void): void;
  onMessageDeleted(callback: (messageId: string) => void): void;
  offMessageDeleted(callback: (messageId: string) => void): void;
  
  // Message sending
  sendMessage(
    recipientId: number, 
    content: string, 
    actualUsername?: string,
    replyToId?: string,
    replyText?: string
  ): Promise<void>;
  
  sendImage(recipientId: number, imageUrl: string, isBlurred?: boolean): Promise<void>;
  sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void>;
  deleteMessage(messageId: string, recipientId: number): Promise<void>;
  
  // Typing indication
  onUserTyping(callback: (userId: number) => void): void;
  offUserTyping(callback: (userId: number) => void): void;
  sendTypingIndication(recipientId: number): void;
  
  // User blocking
  blockUser(userId: number): void;
  unblockUser(userId: number): void;
  isUserBlocked(userId: number): boolean;
  getBlockedUsers(): number[];
  
  // Chat history
  getChatHistory(userId: number): ChatMessage[];
  getAllChatHistory(): Record<number, ChatMessage[]>;
  clearAllChatHistory(): void;
  
  // Read status
  markMessagesAsRead(senderId: number): void;
  
  // Admin functions
  isAdminUser(userId: number): boolean;
  
  // Banned words
  getBannedWords(): string[];
  addBannedWord(word: string): void;
  removeBannedWord(word: string): void;
  setBannedWords(words: string[]): void;
  
  // Reporting
  reportUser(
    reporterId: number,
    reporterName: string,
    reportedId: number,
    reportedName: string,
    reason: string,
    details?: string
  ): void;
  getReports(): UserReport[];
  deleteReport(reportId: string): void;
  
  // Current user getter
  readonly currentUserId: number;
}
