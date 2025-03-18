
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { toast } from 'sonner';
import { supabase as configuredSupabase } from '../integrations/supabase/client';

// Use the already configured client from integrations/supabase/client.ts
export const supabase = configuredSupabase;

// Global connection state to prevent multiple warnings
let connectionWarningShown = false;
let connectionSuccessShown = false;

// Add a simple health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    // Try to query for the presence of the users table first
    const { error: userTableError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    // If that fails, try another table
    if (userTableError) {
      console.log('Could not query users table:', userTableError.message);
      console.log('Falling back to realtime presence test...');
      
      // Try to create a test channel to verify Supabase connection
      const testChannel = supabase.channel('connection-test');
      
      // Create a promise to wait for subscription
      const subscriptionPromise = new Promise<boolean>((resolve) => {
        const timeoutId = setTimeout(() => {
          console.log('Supabase realtime subscription timed out');
          resolve(false);
        }, 5000);
        
        testChannel.subscribe((status) => {
          clearTimeout(timeoutId);
          console.log('Supabase realtime subscription status:', status);
          resolve(status === 'SUBSCRIBED');
          // Clean up test channel
          testChannel.unsubscribe();
        });
      });
      
      const isConnected = await subscriptionPromise;
      
      if (!isConnected) {
        console.error('Failed to connect to Supabase realtime');
        if (!connectionWarningShown) {
          connectionWarningShown = true;
          toast.error('Could not establish real-time connection to Supabase. Features may be limited.', {
            duration: 6000
          });
        }
        return false;
      }
      
      // If we got here, at least realtime works
      console.log('Successfully connected to Supabase realtime');
      if (!connectionSuccessShown) {
        connectionSuccessShown = true;
        toast.success('Connected to Supabase successfully!', {
          id: 'supabase-connection-success'
        });
      }
      return true;
    }
    
    console.log('Successfully connected to Supabase');
    if (!connectionSuccessShown) {
      connectionSuccessShown = true;
      toast.success('Connected to Supabase successfully!', {
        id: 'supabase-connection-success'
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    if (!connectionWarningShown) {
      connectionWarningShown = true;
      toast.error('Could not connect to Supabase. Check your console for details.', {
        duration: 6000
      });
    }
    return false;
  }
};

// Check connection immediately to catch configuration issues early
checkSupabaseConnection()
  .then(isConnected => {
    // Connection status is now handled by the toast in the function
    console.log(`Initial Supabase connection check: ${isConnected ? 'Connected' : 'Failed'}`);
  })
  .catch(err => console.error('Connection check error:', err));
