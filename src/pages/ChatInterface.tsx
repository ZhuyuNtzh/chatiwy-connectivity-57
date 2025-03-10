
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Inbox, User, Filter } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import RulesModal from '../components/RulesModal';

// Mock data for user list
const mockUsers = [
  { id: 1, username: 'Reincarnated', gender: 'Female', age: 36, location: 'Turkey, Istanbul', interests: ['cyan interest', 'gold interest'], isOnline: true },
  { id: 2, username: 'Shinhoff', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['volcano', 'gold interest', 'lime interest'], isOnline: true },
  { id: 3, username: 'Naisees', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['green', 'orange', 'lime interest'], isOnline: true },
  { id: 4, username: 'Moreor', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['volcano interest', 'orange interest'], isOnline: true },
  { id: 5, username: 'Silky', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['volcano', 'gold interest', 'lime interest'], isOnline: true },
  { id: 6, username: 'Mason', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['volcano interest', 'orange interest'], isOnline: true },
  { id: 7, username: 'Jason', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['volcano', 'gold interest', 'lime interest'], isOnline: true },
  { id: 8, username: 'Ludacris', gender: 'Male', age: 32, location: 'Turkey, Istanbul', interests: ['volcano interest', 'orange interest'], isOnline: true },
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
  
  useEffect(() => {
    // If user is not logged in, redirect to user selection
    if (!currentUser) {
      navigate('/');
    }
    
    // Show rules modal if rules not accepted
    if (!rulesAccepted) {
      setIsRulesModalOpen(true);
    }
  }, [currentUser, navigate, rulesAccepted]);
  
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    navigate('/');
  };
  
  const handleRulesAccepted = () => {
    setRulesAccepted(true);
    setIsRulesModalOpen(false);
  };
  
  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f2f7f9]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white shadow-sm flex items-center justify-between px-4 md:px-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">chativy.</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            <span>Inbox</span>
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
      
      <div className="pt-20 px-4 md:px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar: User list */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search Keyword"
                className="pl-9 pr-4 py-2 w-full border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#FB9E41]">People <span className="text-sm text-gray-500">({filteredUsers.length})</span></h2>
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="h-3 w-3 mr-1" />
                Filters
              </Button>
            </div>
          </div>
          
          <div className="divide-y">
            {filteredUsers.map(user => (
              <div key={user.id} className="p-4 hover:bg-gray-50 transition cursor-pointer">
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
                      <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                      <p className="text-xs text-gray-500">{user.gender}, {user.age}</p>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
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
        
        {/* Right content: Empty state */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[600px]">
          <img 
            src="/lovable-uploads/a1551f2b-73e8-42c5-b33d-842ef4dd9fd8.png" 
            alt="Empty state illustration" 
            className="w-48 mb-8"
          />
          <p className="text-xl text-gray-500 font-medium">Friends are waiting for you..</p>
        </div>
      </div>
      
      <RulesModal 
        open={isRulesModalOpen} 
        onOpenChange={setIsRulesModalOpen} 
        onAccept={handleRulesAccepted}
      />
    </div>
  );
};

export default ChatInterface;
