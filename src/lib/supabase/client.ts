
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get Supabase URL and key from the correct project
const supabaseUrl = 'https://awgsmikgomxbzojpirug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Z3NtaWtnb214YnpvanBpcnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjM0NjcsImV4cCI6MjA1Nzk5OTQ2N30.CaPjfgZJpU-45Xbyn24ayTY-KJzXg_QMUzdahLhcfmg';

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
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'chatwii-app'
    },
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

// Test the Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Simple test query
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};
