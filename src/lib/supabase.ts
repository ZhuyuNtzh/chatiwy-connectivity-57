
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { toast } from 'sonner';
import { supabase as configuredSupabase } from '../integrations/supabase/client';

// Use the already configured client from integrations/supabase/client.ts
export const supabase = configuredSupabase;

// Global connection state to prevent multiple warnings
let connectionWarningShown = false;

// Add a simple health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    // Using a simple query to check connection
    const { error } = await supabase.from('user').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist error - the database hasn't been initialized
        console.error('Supabase table "user" not found. Please check if your table exists in your database.');
        toast.error('Database tables not found. Please check your Supabase tables.');
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
    if (!isConnected) {
      // Show toast if connection failed
      toast.error('Could not connect to Supabase. Check your console for details.');
    } else {
      toast.success('Connected to Supabase successfully!');
    }
  })
  .catch(err => console.error('Connection check error:', err));
