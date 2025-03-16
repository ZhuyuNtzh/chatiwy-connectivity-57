
export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  actualUsername?: string; // The actual username for display
  senderId: number;
  recipientId: number;
  timestamp: Date;
  isRead?: boolean;
  isPending?: boolean;
  isDelivered?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  reactionEmojis?: string[];
  reactions?: Record<string, string[]>;
  attachments?: any[];
  isDeleted?: boolean;
  isEdited?: boolean;
  replyToId?: string;
  replyText?: string;
  isBeingRepliedTo?: boolean;
}

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

export interface MessageItem {
  id: string;
  text: string;
  timestamp: Date;
  isFromCurrentUser: boolean;
  user: {
    id: number;
    name: string;
  };
}

export interface TypingIndicator {
  userId: number;
  username: string;
  isTyping: boolean;
  lastTyped: Date;
}

export interface ChatHistoryEntry {
  userId: number;
  messages: ChatMessage[];
}

export interface UserSession {
  userId: number;
  username: string;
  role: 'standard' | 'vip' | 'admin';
  sessionToken: string;
}
