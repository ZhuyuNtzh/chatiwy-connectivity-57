
import { useEffect, useRef } from 'react';
import { signalRService } from '../services/signalRService';
import { supabaseService } from '../services/supabaseService';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';
import { checkSupabaseConnection } from '@/lib/supabase';

// Flag to use Supabase instead of SignalR
const USE_SUPABASE = true;

export const useSignalRConnection = (
  currentUser: UserProfile | null,
  setConnectedUsersCount: (count: number) => void
) => {
  const isAdminRef = useRef(currentUser?.role === 'admin');
  const connectionCheckedRef = useRef(false);
  
  // Update admin ref when role changes
  useEffect(() => {
    isAdminRef.current = currentUser?.role === 'admin';
  }, [currentUser?.role]);
  
  // Check Supabase connection on mount
  useEffect(() => {
    if (USE_SUPABASE && !connectionCheckedRef.current) {
      connectionCheckedRef.current = true;
      checkSupabaseConnection().then(isConnected => {
        if (!isConnected) {
          toast.error("Couldn't connect to Supabase. Please check your configuration.", {
            duration: 6000,
          });
        }
      });
    }
  }, []);
  
  useEffect(() => {
    if (!currentUser) return;

    // Use the actual username from the current user
    const username = currentUser.username || 'Anonymous';
    
    // Generate a user ID from username or use a special ID for admin
    const userId = currentUser.role === 'admin' 
      ? 999 // Special admin ID
      : generateUserId(username);
      
    // Use either Supabase or SignalR based on the flag
    if (USE_SUPABASE) {
      // Convert to string for Supabase
      supabaseService.initialize(userId.toString(), username)
        .then(() => {
          console.log(`Supabase initialized for user ${username} (ID: ${userId})`);
        })
        .catch(err => {
          console.error("Supabase initialization error:", err);
          toast.error("Failed to connect to chat service. Please try again later.");
        });
      
      // Set up connected users count updates
      supabaseService.onConnectedUsersCountChanged(count => {
        // Ensure count is within a reasonable range for demo (8-15)
        const adjustedCount = count > 0 ? Math.min(count, 15) : Math.floor(Math.random() * 8) + 8;
        setConnectedUsersCount(adjustedCount);
      });
    } else {
      // Original SignalR implementation
      signalRService.initialize(userId, username);
      console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
      
      // Set up connected users count updates
      signalRService.onConnectedUsersCountChanged(count => {
        // Ensure count is within a reasonable range for demo (8-15)
        const adjustedCount = count > 0 ? Math.min(count, 15) : Math.floor(Math.random() * 8) + 8;
        setConnectedUsersCount(adjustedCount);
      });
    }
    
    // Simulate connected users count update
    setTimeout(() => {
      const randomCount = Math.floor(Math.random() * 8) + 8; // Between 8-15
      setConnectedUsersCount(randomCount);
    }, 2000);
    
    return () => {
      // Never disconnect admin users, even when component unmounts
      if (!isAdminRef.current) {
        if (USE_SUPABASE) {
          supabaseService.disconnect()
            .then(() => console.log('Supabase disconnected'))
            .catch(err => console.error("Supabase disconnect error:", err));
        } else {
          signalRService.disconnect();
          console.log('SignalR disconnected');
        }
      }
    };
  }, [currentUser, setConnectedUsersCount]);
};

// Helper function to generate a numeric ID from a string
function generateUserId(username: string): number {
  if (!username) return Math.floor(Math.random() * 1000) + 1;
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Ensure it's always positive by using absolute value
  return Math.abs(hash);
}
