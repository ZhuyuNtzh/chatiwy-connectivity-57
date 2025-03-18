
// Export all Supabase-related functions from a single file
export { supabase } from './client';
export { checkSupabaseConnection } from './connection';
export { enableRealtimeForUsers, subscribeToConversation, setupUserPresence } from './realtime';
export { isUsernameTaken, registerUser, updateUserOnlineStatus, getOnlineUsers } from './users';
