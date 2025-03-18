
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { toast } from 'sonner';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a simple fallback client if credentials are missing
// This will allow the app to initialize but functions will fail gracefully
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Global connection state to prevent multiple warnings
let connectionWarningShown = false;

// Add a simple health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      if (!connectionWarningShown) {
        console.warn('Missing Supabase environment variables! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
        connectionWarningShown = true;
      }
      return false;
    }
    
    // Using a simple query to check connection
    const { error } = await supabase.from('user').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist error - the database hasn't been initialized
        console.error('Supabase table "user" not found. Please initialize your database with the SQL script.');
        toast.error('Database tables not found. Please run the initialization SQL script.');
        return false;
      } else {
        console.error('Failed to connect to Supabase:', error.message);
        return false;
      }
    }
    
    console.log('Successfully connected to Supabase');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};

// Check connection immediately to catch configuration issues early
checkSupabaseConnection()
  .then(isConnected => {
    if (!isConnected && supabaseUrl && supabaseAnonKey) {
      // Only show toast if credentials are provided but connection failed
      toast.error('Could not connect to Supabase. Check your console for details.');
    }
  })
  .catch(err => console.error('Connection check error:', err));
