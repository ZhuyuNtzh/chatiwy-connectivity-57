
// Basic Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// Export the already configured client from integrations
import { supabase as configuredSupabase } from '../../integrations/supabase/client';

// Export the client for use throughout the application
export const supabase = configuredSupabase;

// Track connection state globally
export const connectionState = {
  connectionWarningShown: false,
  connectionSuccessShown: false
};
