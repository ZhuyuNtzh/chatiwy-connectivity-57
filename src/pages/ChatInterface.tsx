
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import RulesModal from '../components/RulesModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FiltersDropdown, { Filters } from "../components/FiltersDropdown";

// Enhanced mock users with more details and chatbots
const mockUsers = [
  { id: 1, username: "Alice", gender: "Female", age: 28, location: "Australia, Sydney", interests: ["Art", "Photography", "Travel"], isOnline: true },
  { id: 2, username: "Bob", gender: "Male", age: 35, location: "Canada, Toronto", interests: ["Music", "Technology", "Gaming"], isOnline: false },
  { id: 3, username: "Clara", gender: "Female", age: 24, location: "United Kingdom, London", interests: ["Fashion", "Cooking", "Yoga"], isOnline: true },
  { id: 4, username: "David", gender: "Male", age: 42, location: "France, Paris", interests: ["Cooking", "Wine", "Literature"], isOnline: true },
  { id: 5, username: "Elena", gender: "Female", age: 31, location: "Spain, Madrid", interests: ["Dance", "Fashion", "Fitness"], isOnline: false },
  { id: 6, username: "Feng", gender: "Male", age: 27, location: "China, Beijing", interests: ["History", "Martial Arts", "Calligraphy"], isOnline: true },
  { id: 7, username: "Gabriela", gender: "Female", age: 29, location: "Brazil, Rio de Janeiro", interests: ["Beach", "Samba", "Soccer"], isOnline: true },
  { id: 8, username: "Hiroshi", gender: "Male", age: 33, location: "Japan, Tokyo", interests: ["Anime", "Technology", "Ramen"], isOnline: false },
  { id: 9, username: "Isabella", gender: "Female", age: 26, location: "Italy, Rome", interests: ["Opera", "Fashion", "Pasta"], isOnline: true },
  { id: 10, username: "Jamal", gender: "Male", age: 30, location: "Egypt, Cairo", interests: ["History", "Soccer", "Photography"], isOnline: true },
  // Chatbots with diverse interests and personalities
  { id: 11, username: "ChatBot_Alpha", gender: "Other", age: 25, location: "Digital", interests: ["AI", "Learning", "Helping"], isOnline: true },
  { id: 12, username: "TherapistBot", gender: "Other", age: 30, location: "Digital", interests: ["Psychology", "Counseling", "Support"], isOnline: true },
  { id: 13, username: "TravelGuide", gender: "Other", age: 28, location: "Digital", interests: ["Travel", "Geography", "Culture"], isOnline: true },
  { id: 14, username: "FitnessCoach", gender: "Other", age: 32, location: "Digital", interests: ["Fitness", "Nutrition", "Health"], isOnline: true },
  { id: 15, username: "LanguageTutor", gender: "Other", age: 27, location: "Digital", interests: ["Languages", "Education", "Communication"], isOnline: true },
];

const getInterestColor = (interest: string) => {
  if (interest.includes('cyan')) return 'bg-cyan-100 text-cyan-800';
  if (interest.includes('gold')) return 'bg-yellow-100 text-yellow-800';
  if (interest.includes('volcano')) return 'bg-red-100 text-red-800';
  if (interest.includes('lime')) return 'bg-lime-100 text-lime-800';
  if (interest.includes('green')) return 'bg-green-100 text-green-800';
  if (interest.includes('orange')) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
};

const ChatInterface = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn, rulesAccepted, setRulesAccepted } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(!rulesAccepted);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>({
    gender: ["Male", "Female", "Other"],
    ageRange: [18, 80],
    countries: [],
  });
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
    
    if (!rulesAccepted) {
      setIsRulesModalOpen(true);
    }
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
      activeFilters.countries.some(country => {
        const countryCode = countries.find(c => c.name === user.location.split(',')[0].trim())?.code;
        return countryCode ? activeFilters.countries.includes(countryCode) : false;
      }) ||
      (user.location === "Digital" && activeFilters.countries.includes("Digital"));
    
    return matchesSearch && matchesGender && matchesAge && matchesCountry;
  }).sort((a, b) => {
    // First sort by country
    const countryA = a.location.split(',')[0].trim();
    const countryB = b.location.split(',')[0].trim();
    const countryCompare = countryA.localeCompare(countryB);
    
    // If countries are the same, sort by username
    if (countryCompare === 0) {
      return a.username.localeCompare(b.username);
    }
    
    return countryCompare;
  });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f2f7f9]'}`}>
      <header className={`fixed top-0 left-0 right-0 h-16 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex items-center justify-between px-4 md:px-6`}>
        <div className="flex-1">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>chativy.</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 bg-gray-200 hover:bg-gray-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : ''}`}
          >
            <img 
              src="/lovable-uploads/e3b5491b-50db-4077-a99f-3de3837ccad6.png" 
              alt="Inbox" 
              className="h-5 w-5 invert" 
            />
            <span>Inbox</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 bg-gray-200 hover:bg-gray-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : ''}`}
          >
            <History className="h-5 w-5" />
            <span>History</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDarkMode ? 'bg-primary' : 'bg-gray-200'
              }`}
              onClick={toggleDarkMode}
            >
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium">{currentUser?.username || "Nickname"}</span>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </Button>
        </div>
      </header>
      
      <div className={`pt-20 px-4 md:px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div className={`md:col-span-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Keyword"
                className={`pl-9 pr-4 py-2 w-full border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <h2 className={`text-lg font-semibold text-[#FB9E41]`}>People <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({filteredUsers.length})</span></h2>
              <FiltersDropdown onFiltersChange={handleFiltersChange} />
            </div>
          </div>
          
          <div className="divide-y">
            {filteredUsers.map(user => (
              <div key={user.id} className={`p-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition cursor-pointer`}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                      <User className="h-6 w-6 text-orange-600" />
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
                    
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      <span className="inline-flex items-center">
                        {user.location}
                      </span>
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
        </div>
        
        <div className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[600px]`}>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>
            Select a chat to start messaging
          </p>
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
