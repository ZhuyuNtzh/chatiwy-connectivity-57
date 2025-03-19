
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get Supabase URL and key from environment or use fallback for development
const supabaseUrl = 'https://esqrfcjfctloaukvfjom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcXJmY2pmY3Rsb2F1a3Zmam9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzA1MDMsImV4cCI6MjA1NzkwNjUwM30.dp0M1K2Gzk1zQWLSK9WLZEaoUu6k2G6JOXbTPpMF1Vw';

// Create Supabase client with better config
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,  // Keep session alive between page refreshes
    autoRefreshToken: true, // Automatically refresh token before it expires
    detectSessionInUrl: true, // Detect if a session is in the URL and automatically store it
    storage: localStorage // Use localStorage for session storage
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Increase events per second limit
    }
  },
  db: {
    schema: 'public' // Ensure we're using public schema
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

// Configure realtime channel for better connection
supabase.realtime.setAuth(supabaseKey);

// Initialize a global channel for presence
export const globalChannel = supabase.channel('global_presence', {
  config: {
    presence: {
      key: 'user-presence', // Used to identify this specific presence
    },
  },
});

// Set up presence tracking
globalChannel
  .on('presence', { event: 'sync' }, () => {
    const state = globalChannel.presenceState();
    console.log('Presence synchronized:', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined presence:', key, newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left presence:', key, leftPresences);
  })
  .subscribe();
