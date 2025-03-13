
// This updates the existing UserList page component to use consistent role handling
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
import UserListWithCategories from '@/components/UserListWithCategories';

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
        isVip: true,
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
        isVip: true,
      },
      {
        username: 'SiteAdmin',
        age: 35,
        gender: 'Non-binary',
        interests: ['Technology', 'Photography'],
        location: 'London',
        isOnline: true,
        role: 'admin',
        isAdmin: true,
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
  
  const handleChatUser = (user: UserProfile) => {
    navigate(`/chat/${user.username}`);
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
            
            <div className="mt-4 md:mt-0 flex items-center gap-2">
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
          ) : (
            <UserListWithCategories
              users={filteredUsers}
              onUserSelect={handleChatUser}
              maxHeight="800px"
            />
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
