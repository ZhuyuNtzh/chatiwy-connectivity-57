
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
  enableRealtimeForChat,
  subscribeToTableChanges
} from './realtime';
export { 
  isUsernameTaken, 
  registerUser, 
  updateUserOnlineStatus, 
  getOnlineUsers,
  subscribeToOnlineUsers,
  setupRealtimeSubscription
} from './users';
export {
  generateStableUUID,
  generateUniqueUUID
} from './utils';
