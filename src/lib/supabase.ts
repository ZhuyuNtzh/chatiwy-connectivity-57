
// Re-export from the new modular structure
export { supabase } from './supabase/client';
export { checkSupabaseConnection } from './supabase/connection';
export { enableRealtimeForUsers, subscribeToConversation, setupUserPresence } from './supabase/realtime';
export { isUsernameTaken, registerUser, updateUserOnlineStatus, getOnlineUsers } from './supabase/users';

// Add additional functions if needed, but redirect imports to use the modular structure
// This file exists for backward compatibility
