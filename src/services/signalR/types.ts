
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
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type MessageCallback = (message: ChatMessage) => void;
export type ConnectionStatusCallback = (status: ConnectionStatus) => void;
export type ConnectedUsersCallback = (count: number) => void;

export interface ISignalRService {
  initialize(userId: number, username: string): Promise<void>;
  onMessageReceived(callback: MessageCallback): void;
  onConnectionStatusChanged(callback: ConnectionStatusCallback): void;
  onConnectedUsersCountChanged(callback: ConnectedUsersCallback): void;
  sendMessage(recipientId: number, content: string): Promise<void>;
  sendImage(recipientId: number, imageUrl: string, isBlurred?: boolean): Promise<void>;
  disconnect(): Promise<void>;
}
