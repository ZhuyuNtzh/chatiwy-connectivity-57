
// Export all Supabase-related functions from a single file
export { supabase } from './client';
export { 
  checkSupabaseConnection, 
  initializeSupabase, 
  enableRealtimeSubscription 
} from './connection';
export { 
  subscribeToConversation, 
  setupUserPresence, 
  broadcastUserStatus,
  setupConnectionHeartbeat,
  enableRealtimeForChat
} from './realtime';
export { 
  isUsernameTaken, 
  registerUser, 
  updateUserOnlineStatus, 
  getOnlineUsers 
} from './users';
