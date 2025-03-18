
import { useEffect, useRef, useState } from 'react';
import { signalRService } from '../services/signalRService';
import { supabaseService } from '../services/supabaseService';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';
import { checkSupabaseConnection, isUsernameTaken, registerUser } from '@/lib/supabase';

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

    // Check if username exists before attempting to connect
    const checkUsernameAndConnect = async () => {
      if (USE_SUPABASE) {
        // Generate a consistent user ID from username
        const userId = currentUser.role === 'admin' 
          ? '00000000-0000-0000-0000-000000000999' // Special admin ID
          : `00000000-0000-0000-0000-${generateUserId(currentUser.username).toString().padStart(12, '0')}`;
          
        try {
          // Check if username is taken by another user
          if (currentUser.role !== 'admin') {
            const taken = await isUsernameTaken(currentUser.username);
            if (taken) {
              // Verify if this is actually our own user ID to avoid false positives
              const { data } = await supabase.from('users').select('id').eq('username', currentUser.username).single();
              
              // If user exists with this username but has a different ID, it's a conflict
              if (data && data.id !== userId) {
                toast.error(`Username "${currentUser.username}" is already taken. Please choose another.`);
                return;
              }
            }
          }
          
          console.log(`Initializing Supabase for user ${currentUser.username} (ID: ${userId})`);
          await supabaseService.initialize(userId, currentUser.username);
          
          // Set up connected users count updates
          supabaseService.onConnectedUsersCountChanged(count => {
            console.log(`Connected users count updated: ${count}`);
            setConnectedUsersCount(count);
          });
          
          // Force refresh of connected users count
          setTimeout(() => {
            supabaseService.fetchConnectedUsersCount()
              .then(count => console.log(`Initial connected users count: ${count}`))
              .catch(err => console.error("Error fetching initial user count:", err));
          }, 1000);
          
        } catch (err) {
          console.error("Supabase initialization error:", err);
          toast.error("Failed to connect to chat service. Please try again later.");
          
          // Set a random count even on error
          const randomCount = Math.floor(Math.random() * 8) + 8;
          setConnectedUsersCount(randomCount);
        }
      } else {
        // Original SignalR implementation
        const userId = currentUser.role === 'admin' ? 999 : generateUserId(currentUser.username);
        signalRService.initialize(userId, currentUser.username);
        console.log(`SignalR initialized for user ${currentUser.username} (ID: ${userId})`);
        
        // Set up connected users count updates
        signalRService.onConnectedUsersCountChanged(count => {
          // Ensure count is within a reasonable range for demo (8-15)
          const adjustedCount = count > 0 ? Math.min(count, 15) : Math.floor(Math.random() * 8) + 8;
          setConnectedUsersCount(adjustedCount);
        });
      }
    };
    
    checkUsernameAndConnect();
    
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

// Add Supabase import
import { supabase } from '@/lib/supabase';
