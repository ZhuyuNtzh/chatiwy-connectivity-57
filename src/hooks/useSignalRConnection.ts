
import { useEffect } from 'react';
import { UserProfile } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import { toast } from 'sonner';
import { useOnlineUsers } from './useOnlineUsers';

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

    // Connect to service
    connectToSignalR();

    // Set up window beforeunload event to properly disconnect when page is closed
    const handleBeforeUnload = () => {
      signalRService.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up function
    return () => {
      isMounted = false;
      
      // Disconnect from SignalR
      signalRService.disconnect()
        .catch(err => console.error('Error disconnecting from SignalR:', err));
      
      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, setConnectedUsersCount, onlineCount]);
};
