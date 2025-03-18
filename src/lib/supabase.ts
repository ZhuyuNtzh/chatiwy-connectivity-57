
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Add a simple health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    // Using a simpler query for connection check that doesn't require tables to exist yet
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Failed to connect to Supabase:', error.message);
      return false;
    }
    console.log('Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};
