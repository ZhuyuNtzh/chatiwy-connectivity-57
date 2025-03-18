
import { useEffect, useRef, useState } from 'react';
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
  const [connectionAvailable, setConnectionAvailable] = useState<boolean | null>(null);
  
  // Update admin ref when role changes
  useEffect(() => {
    isAdminRef.current = currentUser?.role === 'admin';
  }, [currentUser?.role]);
  
  // Check Supabase connection on mount
  useEffect(() => {
    if (USE_SUPABASE && !connectionCheckedRef.current) {
      connectionCheckedRef.current = true;
      const checkConnection = async () => {
        try {
          console.log("Checking Supabase connection...");
          const isConnected = await checkSupabaseConnection();
          console.log("Supabase connection check result:", isConnected);
          setConnectionAvailable(isConnected);
          
          if (!isConnected) {
            console.log("Supabase connection failed, will try to continue with fallback...");
            toast.error("Couldn't connect to Supabase. Please check your configuration.", {
              duration: 6000
            });
            
            // Still set a random connected users count for demo purposes
            const randomCount = Math.floor(Math.random() * 8) + 8;
            setConnectedUsersCount(randomCount);
          } else {
            console.log("Supabase connection successful!");
            toast.success('Connected to Supabase successfully!', {
              duration: 3000,
              id: 'supabase-connection-success'
            });
          }
        } catch (error) {
          console.error("Error checking Supabase connection:", error);
          setConnectionAvailable(false);
          toast.error("Error connecting to Supabase", {
            duration: 6000
          });
          
          // Set random count even on error
          const randomCount = Math.floor(Math.random() * 8) + 8;
          setConnectedUsersCount(randomCount);
        }
      };
      
      checkConnection();
    }
  }, [setConnectedUsersCount]);
  
  useEffect(() => {
    if (!currentUser) {
      console.log("No current user, skipping connection setup");
      return;
    }

    // Skip real connection if we know it's unavailable
    if (connectionAvailable === false) {
      console.log("Skipping real connection attempt as Supabase is unavailable");
      
      // Simulate connected users count
      setTimeout(() => {
        const randomCount = Math.floor(Math.random() * 8) + 8;
        setConnectedUsersCount(randomCount);
      }, 1000);
      
      return;
    }

    // Use the actual username from the current user
    const username = currentUser.username || 'Anonymous';
    
    // Generate a user ID from username or use a special ID for admin
    const userId = currentUser.role === 'admin' 
      ? '999' // Special admin ID - convert to string for Supabase
      : username; // Use username as ID for consistent tracking
      
    console.log(`Setting up connection for user ${username} (ID: ${userId}), using Supabase: ${USE_SUPABASE}`);
    
    // Use either Supabase or SignalR based on the flag
    if (USE_SUPABASE) {
      const initializeSupabase = async () => {
        try {
          await supabaseService.initialize(userId, username);
          console.log(`Supabase initialized for user ${username} (ID: ${userId})`);
          
          // Force refresh of connected users count after initialization
          setTimeout(() => {
            supabaseService.fetchConnectedUsersCount()
              .then(count => {
                console.log(`Initial connected users count: ${count}`);
                setConnectedUsersCount(count);
              })
              .catch(err => console.error("Error fetching initial user count:", err));
          }, 1000);
        } catch (err) {
          console.error("Supabase initialization error:", err);
          toast.error("Failed to connect to chat service. Please try again later.");
          
          // Set a random count even on error
          const randomCount = Math.floor(Math.random() * 8) + 8;
          setConnectedUsersCount(randomCount);
        }
      };
      
      initializeSupabase();
      
      // Set up connected users count updates
      supabaseService.onConnectedUsersCountChanged(count => {
        console.log(`Connected users count updated: ${count}`);
        setConnectedUsersCount(count);
      });
    } else {
      // Original SignalR implementation
      signalRService.initialize(parseInt(userId), username);
      console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
      
      // Set up connected users count updates
      signalRService.onConnectedUsersCountChanged(count => {
        // Ensure count is within a reasonable range for demo (8-15)
        const adjustedCount = count > 0 ? Math.min(count, 15) : Math.floor(Math.random() * 8) + 8;
        setConnectedUsersCount(adjustedCount);
      });
    }
    
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
  }, [currentUser, setConnectedUsersCount, connectionAvailable]);
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
