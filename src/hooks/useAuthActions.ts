
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';

export const useAuthActions = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn } = useUser();
  
  const handleLogout = () => {
    return true; // Return true to indicate logout dialog should be shown
  };
  
  const confirmLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('rulesAccepted');
    signalRService.disconnect();
    navigate('/feedback'); // Redirect to feedback page instead of home
  };
  
  const cancelLogout = () => {
    return false; // Return false to indicate logout dialog should be closed
  };
  
  return {
    currentUser,
    handleLogout,
    confirmLogout,
    cancelLogout
  };
};
