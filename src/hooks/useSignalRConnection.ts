
import { useEffect } from 'react';
import { UserProfile } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { updateUserOnlineStatus, registerUser } from '@/lib/supabase/users';
import { initializeSupabase } from '@/lib/supabase/connection';
import { useOnlineUsers } from './useOnlineUsers';
import { 
  setupUserPresence, 
  broadcastUserStatus,
  setupConnectionHeartbeat, 
  enableRealtimeForChat 
} from '@/lib/supabase/realtime';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook to connect to SignalR and update user status
 * @param currentUser The current user profile
 * @param setConnectedUsersCount Callback to update connected users count
 */
export const useSignalRConnection = (
  currentUser: UserProfile | null,
  setConnectedUsersCount?: (count: number) => void
) => {
  // Use our new online users hook
  const { onlineCount } = useOnlineUsers();
  
  // Update connected users count whenever onlineCount changes
  useEffect(() => {
    if (setConnectedUsersCount) {
      setConnectedUsersCount(onlineCount);
    }
  }, [onlineCount, setConnectedUsersCount]);

  useEffect(() => {
    // If we don't have a user, don't connect
    if (!currentUser || !currentUser.username) {
      return;
    }

    // Create a flag to track if this component is mounted
    let isMounted = true;
    
    // Generate a proper UUID if we don't have one
    // This is critical since Supabase expects UUIDs for the user IDs
    const userId = currentUser.id ? 
      (typeof currentUser.id === 'number' ? 
        crypto.randomUUID() : // Generate a UUID if we have a number
        currentUser.id.toString()) : // Use the ID as is if it's a string
      crypto.randomUUID(); // Generate a UUID if we don't have an ID
    
    const username = currentUser.username;
    const userRole = currentUser.role || 'standard';

    // Connect to SignalR hub
    const connectToSignalR = async () => {
      try {
        console.log('Connecting to SignalR hub...');
        // Initialize SignalR service with current user
        await signalRService.initialize(
          // Convert userId to number for signalRService if needed
          typeof userId === 'string' ? parseInt(userId) || 0 : userId, 
          username
        );
        console.log('Successfully connected to SignalR');

        // Also update the user's online status in Supabase
        await updateUserOnlineStatus(userId, true);
        
        // Register user if needed - providing the required third argument
        await registerUser(
          userId, 
          username, 
          userRole
        );
        
        // Set up connected users count change event
        if (setConnectedUsersCount && isMounted) {
          setConnectedUsersCount(onlineCount);
        }
      } catch (error) {
        console.error('Error connecting to SignalR hub:', error);
        toast.error('Failed to connect to chat service. Try refreshing the page.', {
          duration: 5000,
        });
      }
    };

    // Connect to Supabase realtime
    const connectToSupabase = async () => {
      try {
        console.log('Connecting to Supabase realtime...');
        // Initialize Supabase
        const initSuccess = await initializeSupabase();
        if (!initSuccess) {
          console.error('Failed to initialize Supabase');
          return null;
        }
        
        // Enable realtime for all required tables
        await enableRealtimeForChat();
        
        // Register user in Supabase - providing the required third argument
        await registerUser(
          userId,
          username, 
          userRole
        );
        
        // Set up presence channel
        const presenceChannel = setupUserPresence(
          userId,
          (changedUserId, isOnline) => {
            console.log(`User ${changedUserId} is now ${isOnline ? 'online' : 'offline'}`);
            // Update UI or perform actions when user status changes
          }
        );
        
        // Broadcast user's online status
        await broadcastUserStatus(userId, true);
        
        // Set up heartbeat to keep connection alive
        const stopHeartbeat = setupConnectionHeartbeat();
        
        // Initialize Supabase service with current user
        await supabaseService.initialize(userId, username, userRole);
        console.log('Successfully connected to Supabase realtime');
        
        // Return cleanup function
        return () => {
          if (presenceChannel) {
            supabase.removeChannel(presenceChannel);
          }
          stopHeartbeat();
        };
      } catch (error) {
        console.error('Error connecting to Supabase realtime:', error);
        toast.error('Failed to connect to Supabase. Try refreshing the page.', {
          duration: 5000,
        });
        return null;
      }
    };

    // Connect to services
    connectToSignalR();
    let cleanup: (() => void) | null = null;
    
    // Connect to Supabase and store the cleanup function
    connectToSupabase().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    // Set up window beforeunload event to properly disconnect when page is closed
    const handleBeforeUnload = () => {
      signalRService.disconnect();
      supabaseService.disconnect();
      updateUserOnlineStatus(userId, false);
      broadcastUserStatus(userId, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up function
    return () => {
      isMounted = false;
      
      // Disconnect from SignalR
      signalRService.disconnect()
        .catch(err => console.error('Error disconnecting from SignalR:', err));
        
      // Disconnect from Supabase
      supabaseService.disconnect()
        .catch(err => console.error('Error disconnecting from Supabase:', err));
        
      // Update user status in database
      updateUserOnlineStatus(userId, false)
        .catch(err => console.error('Error updating user offline status:', err));
        
      // Broadcast offline status
      broadcastUserStatus(userId, false)
        .catch(err => console.error('Error broadcasting offline status:', err));
        
      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Run any cleanup returned from connectToSupabase
      if (cleanup) cleanup();
    };
  }, [currentUser, setConnectedUsersCount, onlineCount]);
};
