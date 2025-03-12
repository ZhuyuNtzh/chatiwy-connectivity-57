
import * as signalR from '@microsoft/signalr';

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  senderId: number;
  timestamp: Date;
  isImage?: boolean;
  imageUrl?: string;
  senderRole?: string;
  isBlurred?: boolean;
  recipientId?: number;
  isVoiceMessage?: boolean;
  audioUrl?: string;
  replyToId?: string;
  replyText?: string;
  translated?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type MessageCallback = (message: ChatMessage) => void;
export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type ConnectedUsersCallback = (count: number) => void;
export type TypingCallback = (userId: number) => void;

export interface ISignalRService {
  initialize(userId: number, username: string): Promise<void>;
  onMessageReceived(callback: MessageCallback): void;
  offMessageReceived(callback: MessageCallback): void;
  onConnectionStatusChanged(callback: ConnectionStatusCallback): void;
  onConnectedUsersCountChanged(callback: ConnectedUsersCallback): void;
  onUserTyping(callback: TypingCallback): void;
  offUserTyping(callback: TypingCallback): void;
  sendMessage(recipientId: number, content: string): Promise<void>;
  sendImage(recipientId: number, imageUrl: string, isBlurred?: boolean): Promise<void>;
  sendTypingIndication(recipientId: number): void;
  disconnect(): Promise<void>;
}
