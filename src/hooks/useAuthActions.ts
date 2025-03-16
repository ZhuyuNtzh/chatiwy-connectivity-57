import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '@/services/signalRService';

export const useAuthActions = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn, setUserRole } = useUser();

  const handleLogout = useCallback(() => {
    // Clear user session data
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    
    // Clear localStorage data that should not persist between users
    const keysToPreserve = [
      'adminLoggedIn',
      'adminSettings',
      'bannedUsers',
      'bannedWords',
      'customAvatars',
      'photoLimit'
    ];
    
    // Get all keys from localStorage
    const allKeys = Object.keys(localStorage);
    
    // Filter out keys that should be preserved (admin settings)
    const keysToRemove = allKeys.filter(key => {
      // Keep admin-related settings
      if (keysToPreserve.includes(key)) return false;
      
      // Remove user-specific data
      if (key.startsWith('chat_') || 
          key.startsWith('vipStatus_') || 
          key.startsWith('tempVip_') ||
          key.startsWith('replyText_')) {
        return true;
      }
      
      // Default to keeping the key (be conservative about deleting)
      return false;
    });
    
    // Remove the filtered keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear SignalR service state
    signalRService.disconnect();
    signalRService.clearAllChatHistory();
    
    // Reset context state
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole(null);
    
    // Navigate to login page
    navigate('/');
  }, [navigate, setCurrentUser, setIsLoggedIn, setUserRole]);

  // Function to be called when user confirms logout
  const confirmLogout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  // Function to be called when user cancels logout
  const cancelLogout = useCallback(() => {
    // Do nothing, just close the dialog
  }, []);

  return {
    handleLogout,
    confirmLogout,
    cancelLogout
  };
};
