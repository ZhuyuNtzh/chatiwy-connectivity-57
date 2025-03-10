import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';
import Header from '../components/chat/Header';
import SearchBar from '../components/chat/SearchBar';
import RulesModal from '../components/RulesModal';
import FiltersDropdown, { Filters } from "../components/FiltersDropdown";
import UserList from '../components/chat/UserList';
import HistoryDialog from '../components/chat/HistoryDialog';
import InboxDialog from '../components/chat/InboxDialog';
import LogoutDialog from '../components/chat/LogoutDialog';

const siteInterests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Fitness', 'Pets', 'Photography', 'Writing', 'Nature',
  'Cooking', 'Learning languages', 'Current events', 'Hobbies', 'Socializing'
];

const mockUsers = [
  { id: 1, username: "Alice", gender: "Female", age: 28, location: "Australia", interests: ["Art", "Photography", "Travel"], isOnline: true },
  { id: 2, username: "Bob", gender: "Male", age: 35, location: "Canada", interests: ["Music", "Technology", "Gaming"], isOnline: false },
  { id: 3, username: "Clara", gender: "Female", age: 24, location: "United Kingdom", interests: ["Fashion", "Cooking", "Sports"], isOnline: true },
  { id: 4, username: "David", gender: "Male", age: 42, location: "France", interests: ["Cooking", "Books", "Music"], isOnline: true },
  { id: 5, username: "Elena", gender: "Female", age: 31, location: "Spain", interests: ["Sports", "Fashion", "Fitness"], isOnline: false },
  { id: 6, username: "Feng", gender: "Male", age: 27, location: "China", interests: ["Books", "Sports", "Technology"], isOnline: true },
  { id: 7, username: "Gabriela", gender: "Female", age: 29, location: "Brazil", interests: ["Sports", "Music", "Cooking"], isOnline: true },
  { id: 8, username: "Hiroshi", gender: "Male", age: 33, location: "Japan", interests: ["Technology", "Gaming", "Food"], isOnline: false },
  { id: 9, username: "Isabella", gender: "Female", age: 26, location: "Italy", interests: ["Fashion", "Food", "Art"], isOnline: true },
  { id: 10, username: "Jamal", gender: "Male", age: 30, location: "Egypt", interests: ["Books", "Sports", "Photography"], isOnline: true },
  { id: 11, username: "TravelBot", gender: "Male", age: 25, location: "Singapore", interests: ["Travel", "Photography", "Food"], isOnline: true },
  { id: 12, username: "FitnessGuru", gender: "Female", age: 30, location: "Sweden", interests: ["Fitness", "Cooking", "Health"], isOnline: true },
  { id: 13, username: "BookWorm", gender: "Male", age: 28, location: "Germany", interests: ["Books", "Writing", "Movies"], isOnline: true },
  { id: 14, username: "TechGeek", gender: "Female", age: 32, location: "South Korea", interests: ["Technology", "Gaming", "Music"], isOnline: true },
  { id: 15, username: "ArtLover", gender: "Male", age: 27, location: "Mexico", interests: ["Art", "Photography", "Fashion"], isOnline: true },
];

const ChatInterface = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn, rulesAccepted, setRulesAccepted } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(!rulesAccepted);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});
  const [activeFilters, setActiveFilters] = useState<Filters>({
    gender: ["Male", "Female"],
    ageRange: [18, 80],
    countries: [],
  });
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
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
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags');
        const flagsMap: Record<string, string> = {};
        
        response.data.forEach((country: any) => {
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
  
  const handleFiltersChange = (newFilters: Filters) => {
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
  
  const handleUserClick = (user: typeof mockUsers[0]) => {
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f2f7f9]'}`}>
      <Header 
        username={currentUser?.username || "Nickname"}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onHistory={handleShowHistory}
        onInbox={handleShowInbox}
      />
      
      <div className="fixed top-16 bottom-0 left-0 right-0 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`md:col-span-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden flex flex-col h-full`}>
            <div className="p-4 flex-shrink-0">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              <div className="mt-6 flex items-center justify-between">
                <h2 className={`text-lg font-semibold text-[#FB9E41]`}>
                  People <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({connectedUsersCount})</span>
                </h2>
                <FiltersDropdown onFiltersChange={handleFiltersChange} />
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <UserList
                users={filteredUsers}
                selectedUserId={selectedUser?.id || null}
                countryFlags={countryFlags}
                onUserClick={handleUserClick}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
          
          <div className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm h-full flex flex-col`}>
            {selectedUser ? (
              <ChatWindow 
                user={selectedUser}
                countryFlags={countryFlags}
                onClose={handleCloseChat}
              />
            ) : (
              <div className="p-6 flex flex-col items-center justify-center h-full">
                <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>
                  Select a chat to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <RulesModal 
        open={isRulesModalOpen} 
        onOpenChange={setIsRulesModalOpen} 
        onAccept={handleRulesAccepted}
      />

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
      
      <HistoryDialog 
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        chatHistory={chatHistory}
        users={mockUsers}
        onContinueChat={handleContinueChat}
      />
      
      <InboxDialog
        isOpen={showInbox}
        onOpenChange={setShowInbox}
        inboxMessages={inboxMessages}
      />
    </div>
  );
};

export default ChatInterface;
