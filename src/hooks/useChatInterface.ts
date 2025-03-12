
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserProfile } from '../contexts/UserContext';
import { useAuthActions } from './useAuthActions';
import { useUserSelection } from './useUserSelection';
import { useDialogManagement } from './useDialogManagement';
import { useChatHistory } from './useChatHistory';
import { useInactivityTimer } from './useInactivityTimer';
import { useCountryFlags } from './useCountryFlags';
import { useSignalRConnection } from './useSignalRConnection';
import { signalRService } from '../services/signalRService';

interface User {
  id: number;
  username: string;
  gender: string;
  age: number;
  location: string;
  interests: string[];
  isOnline: boolean;
}

export const useChatInterface = (mockUsers: User[]) => {
  const navigate = useNavigate();
  const { currentUser, setIsLoggedIn, userRole } = useUser();
  
  // Initialize all the smaller hooks
  const { handleLogout, confirmLogout, cancelLogout } = useAuthActions();
  const {
    searchTerm,
    setSearchTerm,
    activeFilters,
    selectedUser,
    filteredUsers,
    handleFiltersChange,
    handleUserClick: baseHandleUserClick,
    handleCloseChat
  } = useUserSelection(mockUsers);
  
  const {
    isRulesModalOpen,
    setIsRulesModalOpen,
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    showInbox,
    setShowInbox,
    handleRulesAccepted
  } = useDialogManagement();
  
  const {
    chatHistory,
    setChatHistory,
    inboxMessages,
    setInboxMessages,
    handleShowHistory: baseHandleShowHistory,
    handleShowInbox: baseHandleShowInbox,
    handleContinueChat: baseHandleContinueChat
  } = useChatHistory();
  
  useInactivityTimer();
  
  const {
    countryFlags,
    connectedUsersCount,
    setConnectedUsersCount
  } = useCountryFlags();
  
  // Connect to SignalR - using proper type handling
  useSignalRConnection(currentUser, setConnectedUsersCount);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    // First check session storage for role information
    const storedRole = sessionStorage.getItem('userRole');
    
    if (!currentUser && sessionStorage.getItem('isLoggedIn') !== 'true') {
      // Not logged in at all, redirect to login
      navigate('/');
    } else {
      // User is logged in
      if (currentUser) {
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Double safety check - if user is VIP but on chat interface, redirect to settings
        if ((userRole === 'vip' || storedRole === 'vip' || currentUser.role === 'vip') && 
            window.location.pathname === '/chat-interface') {
          console.log("VIP user detected on chat interface, redirecting to settings");
          navigate('/settings', { replace: true });
        }
      }
    }
  }, [currentUser, navigate, setIsLoggedIn, userRole]);
  
  // Extended user click handler that gets chat history
  const handleUserClick = (user: User) => {
    baseHandleUserClick(user);
    // Get chat history for this user
    const userHistory = signalRService.getChatHistory(user.id) || [];
    if (userHistory.length > 0) {
      setChatHistory(prev => ({
        ...prev,
        [user.id]: userHistory
      }));
    }
  };
  
  // Enhanced history handler
  const handleShowHistory = () => {
    const allHistory = baseHandleShowHistory();
    setIsHistoryDialogOpen(true);
    return allHistory;
  };
  
  // Enhanced inbox handler
  const handleShowInbox = () => {
    const allHistory = baseHandleShowInbox();
    setShowInbox(true);
    return allHistory;
  };
  
  // Enhanced continue chat handler
  const handleContinueChat = (userId: number) => {
    const foundUser = baseHandleContinueChat(userId, mockUsers);
    if (foundUser) {
      handleUserClick(foundUser);
      setIsHistoryDialogOpen(false);
      setShowInbox(false); // Close inbox if it was open
    }
  };
  
  // This is the function to be called when logout is clicked
  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };
  
  // This is the function to be called when logout is confirmed
  const handleConfirmLogout = () => {
    confirmLogout();
    setIsLogoutDialogOpen(false);
  };
  
  // This is the function to be called when logout is cancelled
  const handleCancelLogout = () => {
    setIsLogoutDialogOpen(false);
  };

  return {
    searchTerm,
    setSearchTerm,
    isRulesModalOpen,
    setIsRulesModalOpen,
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
    countryFlags,
    activeFilters,
    selectedUser,
    connectedUsersCount,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    chatHistory,
    setChatHistory,
    showInbox,
    setShowInbox,
    inboxMessages,
    filteredUsers,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
    handleRulesAccepted,
    handleFiltersChange,
    handleUserClick,
    handleCloseChat,
    handleShowHistory,
    handleShowInbox,
    handleContinueChat
  };
};
