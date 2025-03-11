
import { useEffect } from 'react';
import { signalRService } from '../services/signalRService';
import { UserProfile } from '../contexts/UserContext';

interface User {
  id: number;
  username: string;
}

export const useSignalRConnection = (
  currentUser: UserProfile | null,
  setConnectedUsersCount: (count: number) => void
) => {
  useEffect(() => {
    if (currentUser) {
      // Since UserProfile doesn't have an id field, we use a default value or generate one
      // This ensures type compatibility while maintaining functionality
      signalRService.initialize(
        // Use a default ID or generate from username as a workaround
        generateUserId(currentUser.username),
        currentUser.username
      );
      
      signalRService.onConnectedUsersCountChanged(count => {
        setConnectedUsersCount(count);
      });
    }
    
    return () => {
      signalRService.disconnect();
    };
  }, [currentUser, setConnectedUsersCount]);
};

// Helper function to generate a numeric ID from a string
// This function generates a simple hash from the username
function generateUserId(username: string): number {
  let hash = 0;
  if (username.length === 0) return hash;
  
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Ensure it's always positive by using absolute value
  return Math.abs(hash);
}
