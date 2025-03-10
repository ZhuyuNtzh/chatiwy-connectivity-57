
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FiltersDropdown, { Filters } from "../components/FiltersDropdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User as UserIcon, History, Inbox } from 'lucide-react';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';
import Header from '../components/chat/Header';
import SearchBar from '../components/chat/SearchBar';
import RulesModal from '../components/RulesModal';

// List of interests that match the ones on the profile setup page
const siteInterests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Fitness', 'Pets', 'Photography', 'Writing', 'Nature',
  'Cooking', 'Learning languages', 'Current events', 'Hobbies', 'Socializing'
];

// Enhanced mock users with real countries and valid interests
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
  // Chatbots with real countries and valid interests
  { id: 11, username: "TravelBot", gender: "Male", age: 25, location: "Singapore", interests: ["Travel", "Photography", "Food"], isOnline: true },
  { id: 12, username: "FitnessGuru", gender: "Female", age: 30, location: "Sweden", interests: ["Fitness", "Cooking", "Health"], isOnline: true },
  { id: 13, username: "BookWorm", gender: "Male", age: 28, location: "Germany", interests: ["Books", "Writing", "Movies"], isOnline: true },
  { id: 14, username: "TechGeek", gender: "Female", age: 32, location: "South Korea", interests: ["Technology", "Gaming", "Music"], isOnline: true },
  { id: 15, username: "ArtLover", gender: "Male", age: 27, location: "Mexico", interests: ["Art", "Photography", "Fashion"], isOnline: true },
];

const getInterestColor = (interest: string) => {
  const colors = [
    'bg-cyan-100 text-cyan-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-lime-100 text-lime-800',
    'bg-green-100 text-green-800',
    'bg-orange-100 text-orange-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-blue-100 text-blue-800',
  ];
  
  // Generate consistent colors based on interest name
  const hash = interest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

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
  
  // Set up inactivity timer - 30 minutes
  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(new Date());
    };
    
    // Events that reset the timer
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    // Check inactivity every minute
    const checkInactivity = () => {
      const now = new Date();
      const inactiveTime = (now.getTime() - lastActivity.getTime()) / (1000 * 60); // in minutes
      
      if (inactiveTime >= 30) {
        // Disconnect after 30 minutes of inactivity
        signalRService.disconnect();
        setCurrentUser(null);
        setIsLoggedIn(false);
        navigate('/');
      }
    };
    
    const intervalId = window.setInterval(checkInactivity, 60000); // Check every minute
    
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.clearInterval(intervalId);
    };
  }, [lastActivity, navigate, setCurrentUser, setIsLoggedIn]);
  
  useEffect(() => {
    // Check if user is already logged in to prevent redirect on refresh
    if (!currentUser && sessionStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/');
    } else if (currentUser) {
      // Set session storage to remember logged in state
      sessionStorage.setItem('isLoggedIn', 'true');
    }
    
    // Check if rules have been accepted to prevent showing modal again
    if (sessionStorage.getItem('rulesAccepted') === 'true') {
      setRulesAccepted(true);
      setIsRulesModalOpen(false);
    }
    
    // Fetch country flags
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
    
    // Initialize SignalR
    if (currentUser) {
      signalRService.initialize(
        1, // Mock user ID
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
    // First sort by country alphabetically
    const countryA = a.location;
    const countryB = b.location;
    const countryCompare = countryA.localeCompare(countryB);
    
    // If countries are the same, sort by username alphabetically
    if (countryCompare === 0) {
      return a.username.localeCompare(b.username);
    }
    
    return countryCompare;
  });
  
  const handleUserClick = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    // Load chat history for this user
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
    // Here we can implement inbox functionality in the future
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
      
      <div className={`pt-16 px-4 md:px-6 max-w-7xl mx-auto ${selectedUser ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'grid grid-cols-1 md:grid-cols-3 gap-6'}`}>
        <div className={`md:col-span-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
          <div className="p-4">
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
          
          <ScrollArea className="h-[calc(100vh-230px)]">
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`p-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition cursor-pointer ${
                    selectedUser?.id === user.id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                        <UserIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.gender}, {user.age}</p>
                      </div>
                      
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 flex items-center`}>
                        {countryFlags[user.location] && (
                          <img 
                            src={countryFlags[user.location]}
                            alt={`${user.location} flag`}
                            className="w-4 h-3 mr-1 object-cover"
                          />
                        )}
                        <span>{user.location}</span>
                      </p>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.interests.map((interest, idx) => (
                          <span 
                            key={idx} 
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getInterestColor(interest)}`}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm min-h-[600px]`}>
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
      
      <RulesModal 
        open={isRulesModalOpen} 
        onOpenChange={setIsRulesModalOpen} 
        onAccept={handleRulesAccepted}
      />

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Logout Confirmation</DialogTitle>
            <DialogDescription>
              Do you want to leave the chat? We will miss you
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={cancelLogout}
            >
              No
            </Button>
            <Button
              variant="destructive"
              className="hover:bg-red-600"
              onClick={confirmLogout}
            >
              Yes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Chat History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
            <DialogDescription>
              Your recent conversations
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="mt-6 h-96">
            {Object.keys(chatHistory).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(chatHistory).map(([userIdStr, messages]) => {
                  const userId = parseInt(userIdStr);
                  const user = mockUsers.find(u => u.id === userId) || { id: userId, username: `Unknown User ${userId}` };
                  
                  return (
                    <div key={userId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{user.username}</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const foundUser = mockUsers.find(u => u.id === userId);
                            if (foundUser) {
                              handleUserClick(foundUser);
                              setIsHistoryDialogOpen(false);
                            }
                          }}
                        >
                          Continue Chat
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {messages.slice(-3).map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-2 text-sm ${
                                msg.sender === 'You' 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}
                            >
                              {msg.isImage ? (
                                <p className="italic">Image message</p>
                              ) : (
                                <p>{msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content}</p>
                              )}
                              <div className="text-xs opacity-70 mt-1 text-right">
                                {new Date(msg.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        {messages.length > 3 && (
                          <p className="text-center text-xs text-muted-foreground">
                            Showing {messages.length > 3 ? 'last 3 of ' + messages.length : messages.length} messages
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground">No chat history yet</p>
                <p className="text-sm text-muted-foreground mt-2">Start a conversation to see it here</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Inbox Dialog */}
      <Dialog open={showInbox} onOpenChange={setShowInbox}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Inbox</DialogTitle>
            <DialogDescription>
              Your messages
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="mt-6 h-96">
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground">No new messages</p>
              <p className="text-sm text-muted-foreground mt-2">Messages from new users will appear here</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInterface;
