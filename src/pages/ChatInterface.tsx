
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FiltersDropdown, { Filters } from "../components/FiltersDropdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User as UserIcon } from 'lucide-react';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import { signalRService } from '../services/signalRService';
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
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
    
    if (!rulesAccepted) {
      setIsRulesModalOpen(true);
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
  }, [currentUser, navigate, rulesAccepted]);
  
  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };
  
  const confirmLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsLogoutDialogOpen(false);
    navigate('/');
  };
  
  const cancelLogout = () => {
    setIsLogoutDialogOpen(false);
  };
  
  const handleRulesAccepted = () => {
    setRulesAccepted(true);
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
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f2f7f9]'}`}>
      <Header 
        username={currentUser?.username || "Nickname"}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />
      
      <div className={`pt-20 px-4 md:px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6`}>
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
        
        <div className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[600px]`}>
          {selectedUser ? (
            <ChatWindow 
              user={selectedUser}
              countryFlags={countryFlags}
              onClose={handleCloseChat}
            />
          ) : (
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>
              Select a chat to start messaging
            </p>
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
    </div>
  );
};

export default ChatInterface;
