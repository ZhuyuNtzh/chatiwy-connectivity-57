
// Re-export from the new modular structure
export { supabase } from './supabase/client';
export { 
  checkSupabaseConnection, 
  enableRealtimeForUsers as enableRealtimeForUsersDeprecated,
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

// Create an index file to re-export everything from the supabase directory
<lov-write file_path="src/lib/supabase/index.ts">
// Export all Supabase-related functions from a single file
export { supabase } from './client';
export { 
  checkSupabaseConnection,
  enableRealtimeForUsers as enableRealtimeForUsersDeprecated,
  initializeSupabase 
} from './connection';
export { 
  enableRealtimeForUsers, 
  subscribeToConversation, 
  setupUserPresence,
  broadcastUserStatus,
  enableRealtimeForChat
} from './realtime';
export { 
  isUsernameTaken, 
  registerUser, 
  updateUserOnlineStatus, 
  getOnlineUsers 
} from './users';
