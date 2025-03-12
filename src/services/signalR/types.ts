
// Update SignalR service and ChatMessage types

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface ChatMessage {
  id: string;
  content?: string;
  sender: string;
  senderId: number;
  recipientId?: number;
  timestamp: Date;
  isImage?: boolean;
  imageUrl?: string;
  isBlurred?: boolean;
  isVoiceMessage?: boolean;
  audioUrl?: string;
  replyToId?: string;
  replyText?: string;
  translated?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isDeleted?: boolean;
}

export type MessageCallback = (message: ChatMessage) => void;
export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type ConnectedUsersCallback = (count: number) => void;
export type TypingCallback = (userId: number) => void;
export type MessageDeletedCallback = (messageId: string) => void;

export interface ISignalRService {
  initialize(userId: number, username: string): Promise<void>;
  onMessageReceived(callback: MessageCallback): void;
  offMessageReceived(callback: MessageCallback): void;
  onMessageDeleted(callback: MessageDeletedCallback): void;
  offMessageDeleted(callback: MessageDeletedCallback): void;
  onUserTyping(callback: TypingCallback): void;
  offUserTyping(callback: TypingCallback): void;
  onConnectionStatusChanged(callback: ConnectionStatusCallback): void;
  onConnectedUsersCountChanged(callback: ConnectedUsersCallback): void;
  sendMessage(recipientId: number, content: string): Promise<void>;
  sendImage(recipientId: number, imageUrl: string, isBlurred?: boolean): Promise<void>;
  sendVoiceMessage(recipientId: number, audioUrl: string): Promise<void>;
  deleteMessage(messageId: string, recipientId: number): Promise<void>;
  sendTypingIndication(recipientId: number): void;
  disconnect(): Promise<void>;
  blockUser(userId: number): void;
  unblockUser(userId: number): void;
  isUserBlocked(userId: number): boolean;
  getBlockedUsers(): number[];
  getChatHistory(userId: number): ChatMessage[];
  getAllChatHistory(): Record<number, ChatMessage[]>;
  clearAllChatHistory(): void;
}
