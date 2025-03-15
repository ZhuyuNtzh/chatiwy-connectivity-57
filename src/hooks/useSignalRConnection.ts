
import { useEffect, useRef } from 'react';
import { signalRService } from '../services/signalRService';
import { UserProfile } from '../contexts/UserContext';

export const useSignalRConnection = (
  currentUser: UserProfile | null,
  setConnectedUsersCount: (count: number) => void
) => {
  const isAdminRef = useRef(currentUser?.role === 'admin');
  
  // Update admin ref when role changes
  useEffect(() => {
    isAdminRef.current = currentUser?.role === 'admin';
  }, [currentUser?.role]);
  
  useEffect(() => {
    if (currentUser) {
      // Since UserProfile doesn't have an id field, we use a default value or generate one
      // For admin users, use a special ID
      const userId = currentUser.role === 'admin' 
        ? 999 // Special admin ID
        : generateUserId(currentUser.username);
        
      signalRService.initialize(userId, currentUser.username);
      
      signalRService.onConnectedUsersCountChanged(count => {
        setConnectedUsersCount(count);
      });
    }
    
    return () => {
      // Never disconnect admin users, even when component unmounts
      if (currentUser && !isAdminRef.current) {
        signalRService.disconnect();
      }
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
