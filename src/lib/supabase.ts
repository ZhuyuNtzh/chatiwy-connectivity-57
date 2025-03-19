
// Re-export from the new modular structure
export { supabase } from './supabase/client';
export { 
  checkSupabaseConnection, 
  enableRealtimeForUsersDeprecated,
  initializeSupabase 
} from './supabase/connection';
export { 
  enableRealtimeForUsers, 
  subscribeToConversation, 
  setupUserPresence,
  broadcastUserStatus,
  enableRealtimeForChat
} from './supabase/realtime';
export { 
  isUsernameTaken, 
  registerUser, 
  updateUserOnlineStatus, 
  getOnlineUsers 
} from './supabase/users';
