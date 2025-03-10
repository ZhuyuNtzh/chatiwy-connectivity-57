
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';

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
  const { currentUser, setCurrentUser, setIsLoggedIn, rulesAccepted, setRulesAccepted } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(!rulesAccepted);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});
  const [activeFilters, setActiveFilters] = useState<{
    gender: string[];
    ageRange: [number, number];
    countries: string[];
  }>({
    gender: ["Male", "Female"],
    ageRange: [18, 80],
    countries: [],
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [connectedUsersCount, setConnectedUsersCount] = useState(0);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<number, ChatMessage[]>>({});
  const [showInbox, setShowInbox] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<Record<number, ChatMessage[]>>({});
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const inactivityTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(new Date());
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    const checkInactivity = () => {
      const now = new Date();
      const inactiveTime = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      if (inactiveTime >= 30) {
        signalRService.disconnect();
        setCurrentUser(null);
        setIsLoggedIn(false);
        navigate('/');
      }
    };
    
    const intervalId = window.setInterval(checkInactivity, 60000);
    
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.clearInterval(intervalId);
    };
  }, [lastActivity, navigate, setCurrentUser, setIsLoggedIn]);
  
  useEffect(() => {
    if (!currentUser && sessionStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/');
    } else if (currentUser) {
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    
    if (sessionStorage.getItem('rulesAccepted') === 'true') {
      setRulesAccepted(true);
      setIsRulesModalOpen(false);
    }
    
    const fetchCountryFlags = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await response.json();
        const flagsMap: Record<string, string> = {};
        
        data.forEach((country: any) => {
          flagsMap[country.name.common] = country.flags.svg;
        });
        
        setCountryFlags(flagsMap);
      } catch (error) {
        console.error('Error fetching country flags:', error);
      }
    };

    fetchCountryFlags();
    
    if (currentUser) {
      signalRService.initialize(
        1,
        currentUser.username
      );
      
      signalRService.onConnectedUsersCountChanged(count => {
        setConnectedUsersCount(count);
      });
    }
    
    return () => {
      signalRService.disconnect();
    };
  }, [currentUser, navigate, rulesAccepted, setRulesAccepted]);
  
  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };
  
  const confirmLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('rulesAccepted');
    setIsLogoutDialogOpen(false);
    navigate('/');
  };
  
  const cancelLogout = () => {
    setIsLogoutDialogOpen(false);
  };
  
  const handleRulesAccepted = () => {
    setRulesAccepted(true);
    sessionStorage.setItem('rulesAccepted', 'true');
    setIsRulesModalOpen(false);
  };
  
  const handleFiltersChange = (newFilters: {
    gender: string[];
    ageRange: [number, number];
    countries: string[];
  }) => {
    setActiveFilters(newFilters);
  };
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = activeFilters.gender.includes(user.gender);
    
    const matchesAge = user.age >= activeFilters.ageRange[0] && user.age <= activeFilters.ageRange[1];
    
    const matchesCountry = activeFilters.countries.length === 0 || 
      activeFilters.countries.includes(user.location);
    
    return matchesSearch && matchesGender && matchesAge && matchesCountry;
  }).sort((a, b) => {
    const countryA = a.location;
    const countryB = b.location;
    const countryCompare = countryA.localeCompare(countryB);
    
    if (countryCompare === 0) {
      return a.username.localeCompare(b.username);
    }
    
    return countryCompare;
  });
  
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    const userHistory = signalRService.getChatHistory(user.id) || [];
    if (userHistory.length > 0) {
      setChatHistory(prev => ({
        ...prev,
        [user.id]: userHistory
      }));
    }
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
  };
  
  const handleShowHistory = () => {
    const allHistory = signalRService.getAllChatHistory();
    setChatHistory(allHistory);
    setIsHistoryDialogOpen(true);
  };
  
  const handleShowInbox = () => {
    setShowInbox(!showInbox);
  };

  const handleContinueChat = (userId: number) => {
    const foundUser = mockUsers.find(u => u.id === userId);
    if (foundUser) {
      handleUserClick(foundUser);
      setIsHistoryDialogOpen(false);
    }
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
    handleLogout,
    confirmLogout,
    cancelLogout,
    handleRulesAccepted,
    handleFiltersChange,
    handleUserClick,
    handleCloseChat,
    handleShowHistory,
    handleShowInbox,
    handleContinueChat
  };
};
