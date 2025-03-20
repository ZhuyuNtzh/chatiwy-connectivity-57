
import { supabase } from "@/lib/supabase";

/**
 * Core Supabase service functionality for testing connections and updating user status
 */
export const supabaseCore = {
  /**
   * Test connection to Supabase
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      return { data, error };
    } catch (err) {
      console.error('Test connection error:', err);
      return { data: null, error: err as any };
    }
  },
  
  /**
   * Update user's online status in the database
   */
  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_online: isOnline, 
          last_active: new Date().toISOString() 
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating online status:', error);
      }
    } catch (err) {
      console.error('Error updating online status:', err);
    }
  }
};
