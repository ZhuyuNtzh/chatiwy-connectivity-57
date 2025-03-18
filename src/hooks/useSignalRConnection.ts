
import { useEffect } from 'react';
import { UserProfile } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { updateUserOnlineStatus } from '@/lib/supabase';

/**
 * Hook to connect to SignalR and update user status
 * @param currentUser The current user profile
 * @param setConnectedUsersCount Callback to update connected users count
 */
export const useSignalRConnection = (
  currentUser: UserProfile | null,
  setConnectedUsersCount?: (count: number) => void
) => {
  useEffect(() => {
    // If we don't have a user, don't connect
    if (!currentUser || !currentUser.username) {
      return;
    }

    // Create a flag to track if this component is mounted
    let isMounted = true;
    // Use string ID if available, or use username as fallback
    const userId = currentUser.id || currentUser.username;
    const username = currentUser.username;

    // Connect to SignalR hub
    const connectToSignalR = async () => {
      try {
        console.log('Connecting to SignalR hub...');
        // Initialize SignalR service with current user
        // Convert userId to number for signalRService
        await signalRService.initialize(Number(userId), username);
        console.log('Successfully connected to SignalR');

        // Also update the user's online status in Supabase
        await updateUserOnlineStatus(userId, true);
        
        // Set up connected users count change event
        if (setConnectedUsersCount) {
          signalRService.onConnectedUsersCountChanged((count) => {
            if (isMounted) {
              setConnectedUsersCount(count);
            }
          });
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
        // Initialize Supabase service with current user
        await supabaseService.initialize(userId, username);
        console.log('Successfully connected to Supabase realtime');

        // Set up connected users count change event
        if (setConnectedUsersCount) {
          supabaseService.onConnectedUsersCountChanged((count) => {
            if (isMounted) {
              setConnectedUsersCount(count);
            }
          });
        }
      } catch (error) {
        console.error('Error connecting to Supabase realtime:', error);
        toast.error('Failed to connect to Supabase. Try refreshing the page.', {
          duration: 5000,
        });
      }
    };

    // Connect to services
    connectToSignalR();
    connectToSupabase();

    // Set up window beforeunload event to properly disconnect when page is closed
    const handleBeforeUnload = () => {
      signalRService.disconnect();
      supabaseService.disconnect();
      updateUserOnlineStatus(userId, false);
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
        
      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, setConnectedUsersCount]);
};
