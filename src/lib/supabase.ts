
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
  broadcastUserStatus
} from './supabase/realtime';
export { 
  isUsernameTaken, 
  registerUser, 
  updateUserOnlineStatus, 
  getOnlineUsers 
} from './supabase/users';
