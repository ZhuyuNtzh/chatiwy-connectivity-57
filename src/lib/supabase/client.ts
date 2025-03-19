
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with public anon key
const supabaseUrl = 'https://esqrfcjfctloaukvfjom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcXJmY2pmY3Rsb2F1a3Zmam9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzA1MDMsImV4cCI6MjA1NzkwNjUwM30.dp0M1K2Gzk1zQWLSK9WLZEaoUu6k2G6JOXbTPpMF1Vw';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Track connection state to prevent duplicate messages
export const connectionState = {
  connectionWarningShown: false,
  connectionSuccessShown: false,
  realtimeEnabled: false
};
