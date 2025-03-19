
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment or use fallback for development
const supabaseUrl = 'https://esqrfcjfctloaukvfjom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcXJmY2pmY3Rsb2F1a3Zmam9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzA1MDMsImV4cCI6MjA1NzkwNjUwM30.dp0M1K2Gzk1zQWLSK9WLZEaoUu6k2G6JOXbTPpMF1Vw';

// Create Supabase client with better config
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,  // Keep session alive between page refreshes
    autoRefreshToken: true // Automatically refresh token before it expires
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Increase events per second limit
    }
  }
});

// Track connection state to prevent duplicate messages
export const connectionState = {
  connectionWarningShown: false,
  connectionSuccessShown: false,
  realtimeEnabled: false,
  lastConnectionCheck: Date.now(),
  reconnectAttempts: 0,
  maxReconnectAttempts: 5
};

// Listen for realtime presence changes globally
supabase.channel('global_presence')
  .on('presence', { event: 'sync' }, () => {
    console.log('Presence synchronized');
  })
  .on('presence', { event: 'join' }, () => {
    console.log('User joined presence');
  })
  .on('presence', { event: 'leave' }, () => {
    console.log('User left presence');
  })
  .subscribe();
