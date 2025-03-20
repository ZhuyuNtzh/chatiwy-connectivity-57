
import { ChatMessage } from "../signalR/types";

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type DatabaseMessage = {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_type: string;
  media_url: string | null;
};

export interface MessageCallback {
  (message: ChatMessage): void;
}

export interface TypingCallback {
  (userId: number, isTyping: boolean): void;
}

export interface UserStatusCallback {
  (userId: number, isOnline: boolean): void;
}

export interface UsersCountCallback {
  (count: number): void;
}
