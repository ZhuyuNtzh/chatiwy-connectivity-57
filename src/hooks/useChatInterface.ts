
import { useEffect, useState } from 'react';
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
import { useMessages } from './useMessages';

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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Use the messages hook to track unread count
  const { unreadCount, resetUnreadCount } = useMessages(selectedUserId || 0, userRole || 'standard');
  
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
    if (!currentUser && sessionStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/');
    } else if (currentUser) {
      sessionStorage.setItem('isLoggedIn', 'true');
    }
  }, [currentUser, navigate, setIsLoggedIn]);
  
  // Extended user click handler that gets chat history and resets notifications
  const handleUserClick = (user: User) => {
    const previousUserId = selectedUserId;
    setSelectedUserId(user.id);
    baseHandleUserClick(user);
    
    // Get chat history for this user
    const userHistory = signalRService.getChatHistory(user.id) || [];
    if (userHistory.length > 0) {
      setChatHistory(prev => ({
        ...prev,
        [user.id]: userHistory
      }));
    }
    
    // If we're changing conversations and the new user has sent messages, reduce the unread count
    const hasUnreadMessages = userHistory.some(msg => 
      msg.senderId === user.id && 
      msg.recipientId === signalRService.currentUserId
    );
    
    if (hasUnreadMessages && previousUserId !== user.id) {
      // Let useMessages effect handle the counter reduction
      console.log(`Opening conversation with user ${user.id} who has sent messages`);
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
    // Get fresh chat history when opening inbox
    const allHistory = signalRService.getAllChatHistory();
    setInboxMessages(allHistory);
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

  // Handler for when inbox dialog is opened
  const handleInboxOpened = () => {
    resetUnreadCount();
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
    unreadCount,
    handleLogoutClick,
    handleConfirmLogout,
    handleCancelLogout,
    handleRulesAccepted,
    handleFiltersChange,
    handleUserClick,
    handleCloseChat,
    handleShowHistory,
    handleShowInbox,
    handleContinueChat,
    handleInboxOpened
  };
};
