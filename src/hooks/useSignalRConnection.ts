
import { useEffect, useRef } from 'react';
import { signalRService } from '../services/signalRService';
import { UserProfile } from '../contexts/UserContext';
import { toast } from 'sonner';

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
      // Use the actual username from the current user
      const username = currentUser.username || 'Anonymous';
      
      // Since UserProfile doesn't have an id field, we use a default value or generate one
      // For admin users, use a special ID
      const userId = currentUser.role === 'admin' 
        ? 999 // Special admin ID
        : generateUserId(username);
        
      signalRService.initialize(userId, username);
      
      // Log success for debugging
      console.log(`SignalR initialized for user ${username} (ID: ${userId})`);
      
      signalRService.onConnectedUsersCountChanged(count => {
        // Ensure count is within a reasonable range for demo
        const adjustedCount = count > 0 ? count : Math.floor(Math.random() * 10) + 8;
        setConnectedUsersCount(adjustedCount);
      });
      
      // Simulate connected users count update
      setTimeout(() => {
        const randomCount = Math.floor(Math.random() * 10) + 8; // Between 8-17
        setConnectedUsersCount(randomCount);
      }, 2000);
    }
    
    return () => {
      // Never disconnect admin users, even when component unmounts
      if (currentUser && !isAdminRef.current) {
        signalRService.disconnect();
        console.log('SignalR disconnected');
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
