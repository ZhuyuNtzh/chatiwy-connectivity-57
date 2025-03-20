
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import { toast } from 'sonner';

export const useAuthActions = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn } = useUser();
  
  const handleLogout = () => {
    return true; // Return true to indicate logout dialog should be shown
  };
  
  const confirmLogout = () => {
    // Disconnect from services
    signalRService.disconnect();
    
    // Clear user data
    setCurrentUser(null);
    setIsLoggedIn(false);
    
    // Clear session storage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('rulesAccepted');
    sessionStorage.removeItem('allowVIPChatAccess');
    
    // Clear any username from localStorage to prevent reuse issues
    localStorage.removeItem('username');
    
    // DO NOT clear userUUID as we want to maintain a stable identity
    // This prevents username spam on reconnection
    
    navigate('/feedback'); // Redirect to feedback page
  };
  
  const cancelLogout = () => {
    return false; // Return false to indicate logout dialog should be closed
  };
  
  const handleLogin = (userData: any, role = 'vip') => {
    // Store userUUID if provided, otherwise generate one
    // This ensures we have a stable identity for this user
    if (userData.id && !localStorage.getItem('userUUID')) {
      localStorage.setItem('userUUID', userData.id.toString());
    }
    
    // Store username to ensure consistent display
    if (userData.username) {
      localStorage.setItem('username', userData.username);
    }
    
    // Set user data
    setCurrentUser(userData);
    setIsLoggedIn(true);
    
    // Store login status in session storage
    sessionStorage.setItem('isLoggedIn', 'true');
    
    // Toast message for successful login
    toast.success(`Welcome back, ${userData.username}!`);
    
    // Navigate to settings page
    navigate('/settings');
  };
  
  return {
    currentUser,
    handleLogout,
    confirmLogout,
    cancelLogout,
    handleLogin
  };
};
