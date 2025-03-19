
// Re-export from the new modular structure
export { supabase } from './supabase/client';
export { 
  checkSupabaseConnection, 
  enableRealtimeForUsers,
  initializeSupabase 
} from './supabase/connection';
export { 
  enableRealtimeForUsers as enableRealtimeForChat, 
  subscribeToConversation, 
  setupUserPresence,
  broadcastUserStatus,
  setupConnectionHeartbeat
} from './supabase/realtime';
export { 
  isUsernameTaken, 
  registerUser, 
  updateUserOnlineStatus, 
  getOnlineUsers,
  subscribeToOnlineUsers,
  setupRealtimeSubscription
} from './supabase/users';
