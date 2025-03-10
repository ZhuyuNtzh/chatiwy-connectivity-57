import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '../components/Header';
import UserCard from '../components/UserCard';
import RulesModal from '../components/RulesModal';
import { useUser, UserProfile } from '../contexts/UserContext';
import { Search, UserPlus, RefreshCw, X } from 'lucide-react';

const UserList = () => {
  const navigate = useNavigate();
  const { currentUser, rulesAccepted, setRulesAccepted } = useUser();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(!rulesAccepted);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const mockUsers: UserProfile[] = [
      {
        username: 'JaneWilson',
        age: 28,
        gender: 'Female',
        interests: ['Music', 'Art', 'Travel'],
        location: 'New York',
        isOnline: true,
        role: 'standard',
      },
      {
        username: 'TechGuy123',
        age: 32,
        gender: 'Male',
        interests: ['Technology', 'Gaming', 'Movies'],
        location: 'San Francisco',
        isOnline: true,
        role: 'vip',
      },
      {
        username: 'BookLover22',
        age: 25,
        gender: 'Female',
        interests: ['Books', 'Writing', 'Coffee'],
        location: 'Chicago',
        isOnline: false,
        role: 'standard',
      },
      {
        username: 'NatureFan',
        age: 30,
        gender: 'Non-binary',
        interests: ['Hiking', 'Photography', 'Camping'],
        location: 'Portland',
        isOnline: true,
        role: 'standard',
      },
      {
        username: 'FitnessPro',
        age: 27,
        gender: 'Male',
        interests: ['Fitness', 'Nutrition', 'Sports'],
        location: 'Los Angeles',
        isOnline: false,
        role: 'vip',
      },
      {
        username: 'SiteAdmin',
        age: 35,
        gender: 'Non-binary',
        interests: ['Technology', 'Photography'],
        location: 'London',
        isOnline: true,
        role: 'admin',
      },
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    handleFilterUsers();
  }, [searchQuery, activeTab, users]);
  
  const handleFilterUsers = () => {
    let filtered = [...users];
    
    if (activeTab === 'online') {
      filtered = filtered.filter(user => user.isOnline);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        (user.interests && user.interests.some(interest => interest.toLowerCase().includes(query))) ||
        (user.location && user.location.toLowerCase().includes(query))
      );
    }
    
    filtered = filtered.filter(user => user.username !== currentUser?.username);
    
    setFilteredUsers(filtered);
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      handleFilterUsers();
      setIsLoading(false);
    }, 1000);
  };
  
  const handleChatUser = (username: string) => {
    navigate(`/chat/${username}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chat Users</h1>
              <p className="text-muted-foreground">
                Find someone to chat with
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, interests, or location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-10 pr-10 w-full md:w-64"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full"
                    onClick={() => setSearchQuery('')}
                  >
                    <span className="sr-only">Clear search</span>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center">
                <TabsList className="glass">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="online">Online Now</TabsTrigger>
                </TabsList>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  className="h-9 w-9 rounded-full hover:bg-muted"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </Tabs>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div className="flex-1">
                      <div className="h-4 w-1/4 bg-muted rounded mb-2"></div>
                      <div className="h-3 w-1/3 bg-muted rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="glass-card p-8 text-center animate-fade-in">
              <UserPlus className="h-16 w-16 mx-auto mb-4 text-muted" />
              <h3 className="text-xl font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "No users match your search criteria" 
                  : activeTab === 'online' 
                    ? "No users are currently online" 
                    : "No users available to chat"
                }
              </p>
              <Button onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <UserCard 
                  key={user.username} 
                  user={user} 
                  animationDelay={index * 0.05}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <RulesModal
        open={isRulesModalOpen}
        onOpenChange={(open) => {
          setIsRulesModalOpen(open);
          if (!open) {
            setRulesAccepted(true);
          }
        }}
      />
    </div>
  );
};

export default UserList;
