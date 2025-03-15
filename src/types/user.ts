
// User type definitions
export type UserRole = 'standard' | 'vip' | 'admin';

export interface UserProfile {
  username: string;
  age?: number;
  gender?: string;
  interests?: string[];
  location?: string;
  isOnline?: boolean;
  lastActive?: Date;
  role: UserRole;
  avatarUrl?: string;
  avatar?: string;
  isVip?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  joinedAt?: Date;
  email?: string;
  isBanned?: boolean;
  banExpiresAt?: Date;
  isBot?: boolean;
  tempVipExpiresAt?: Date;
  isVisible?: boolean; // Admin visibility toggle
  phoneNumber?: string; // For admin contact
}

export interface BannedUser {
  username: string;
  userId: number;
  banReason?: string;
  bannedAt: Date;
  banExpiresAt?: Date;
  bannedBy: string;
  ipAddress?: string;
}

export interface AdminSettings {
  isVisible: boolean;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}
