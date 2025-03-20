
import { supabase } from "@/lib/supabase";
import { setupUserPresence } from "@/lib/supabase/realtime";
import { UserStatusCallback } from "./types";

/**
 * User-related functionality for the Supabase service
 */
export const supabaseUsers = {
  /**
   * Set up realtime presence for user status
   */
  setupRealtimePresence(userId: string, username: string, onUserStatusChange: (userId: string, isOnline: boolean) => void) {
    if (!userId) return null;
    
    return setupUserPresence(
      userId, 
      username,
      onUserStatusChange
    );
  },
  
  /**
   * Load blocked users from the database
   */
  async loadBlockedUsers(userId: string): Promise<Set<number>> {
    if (!userId) return new Set<number>();
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', userId);
        
      if (error) {
        console.error('Error loading blocked users:', error);
        return new Set<number>();
      }
      
      const blockedUsers = new Set<number>();
      if (data) {
        data.forEach(item => {
          const numericId = parseInt(item.blocked_id);
          if (!isNaN(numericId)) {
            blockedUsers.add(numericId);
          }
        });
      }
      
      console.log(`Loaded ${blockedUsers.size} blocked users`);
      return blockedUsers;
    } catch (err) {
      console.error('Exception loading blocked users:', err);
      return new Set<number>();
    }
  },
  
  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedId: number): Promise<boolean> {
    if (!blockerId) return false;
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: blockerId,
          blocked_id: blockedId.toString(),
        });
        
      if (error) {
        console.error('Error blocking user:', error);
        return false;
      }
      
      console.log(`User ${blockedId} blocked`);
      return true;
    } catch (err) {
      console.error('Exception blocking user:', err);
      return false;
    }
  },
  
  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, blockedId: number): Promise<boolean> {
    if (!blockerId) return false;
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId.toString());
        
      if (error) {
        console.error('Error unblocking user:', error);
        return false;
      }
      
      console.log(`User ${blockedId} unblocked`);
      return true;
    } catch (err) {
      console.error('Exception unblocking user:', err);
      return false;
    }
  },
  
  /**
   * Report a user
   */
  async reportUser(reporterId: string, reporterName: string, reportedId: number, reason: string): Promise<boolean> {
    if (!reporterId || !reporterName) return false;
    
    try {
      const { data: reportedUser, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', reportedId.toString())
        .maybeSingle();
        
      if (userError || !reportedUser) {
        console.error('Error fetching reported user:', userError);
        return false;
      }
      
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: reporterId,
          reported_id: reportedId.toString(),
          reason: reason,
          reporter_name: reporterName,
          reported_name: reportedUser.username,
          details: reason,
          status: 'pending',
        });
        
      if (error) {
        console.error('Error reporting user:', error);
        return false;
      }
      
      console.log(`User ${reportedId} reported for: ${reason}`);
      return true;
    } catch (err) {
      console.error('Exception reporting user:', err);
      return false;
    }
  },
  
  /**
   * Get blocked users
   */
  async getBlockedUsers(userId: string): Promise<any[]> {
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          blocked_id,
          blocked_user:blocked_id(
            username,
            id
          )
        `)
        .eq('blocker_id', userId);
        
      if (error) {
        console.error('Error fetching blocked users:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Exception fetching blocked users:', err);
      return [];
    }
  },
  
  /**
   * Fetch count of connected users
   */
  async fetchConnectedUsersCount(): Promise<number> {
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('is_online', true);
        
      if (error) {
        console.error('Error fetching connected users count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (err) {
      console.error('Exception fetching connected users count:', err);
      return 0;
    }
  }
};
