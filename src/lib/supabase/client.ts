
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get Supabase URL and key from environment or use fallback for development
const supabaseUrl = 'https://esqrfcjfctloaukvfjom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcXJmY2pmY3Rsb2F1a3Zmam9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzA1MDMsImV4cCI6MjA1NzkwNjUwM30.dp0M1K2Gzk1zQWLSK9WLZEaoUu6k2G6JOXbTPpMF1Vw';

// Create Supabase client with better config
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, 
    storage: localStorage
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      // Add custom fetch retry logic or timeout handling
      return fetch(input, init).catch(err => {
        console.error("Network error in Supabase request:", err);
        toast.error("Network error. Please check your connection.");
        throw err;
      });
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

// Set up presence channel with more robust error handling
export const globalChannel = supabase.channel('global_presence', {
  config: {
    presence: {
      key: 'user-presence',
    },
  },
});

// Set up presence tracking with better error handling
globalChannel
  .on('presence', { event: 'sync' }, () => {
    try {
      const state = globalChannel.presenceState();
      console.log('Presence synchronized:', state);
    } catch (err) {
      console.error('Error in presence sync:', err);
    }
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined presence:', key, newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left presence:', key, leftPresences);
  })
  .subscribe((status) => {
    console.log('Presence channel status:', status);
    
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to presence channel');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Error in presence channel subscription');
      
      // Try to reconnect after a short delay
      setTimeout(() => {
        console.log('Attempting to reconnect presence channel');
        globalChannel.subscribe();
      }, 3000);
    }
  });
