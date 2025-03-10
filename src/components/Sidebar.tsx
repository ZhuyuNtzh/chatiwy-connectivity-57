
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, History, Ban, X, User } from 'lucide-react';
import { UserProfile } from '../contexts/UserContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for demonstration
const mockUsers: UserProfile[] = [
  {
    username: 'JaneDoe42',
    age: 28,
    gender: 'Female',
    interests: ['Music', 'Art', 'Travel'],
    location: 'New York',
    isOnline: true,
    role: 'standard',
  },
  {
    username: 'TechGuy007',
    age: 32,
    gender: 'Male',
    interests: ['Technology', 'Gaming'],
    location: 'San Francisco',
    isOnline: false,
    role: 'vip',
  },
  {
    username: 'SiteAdmin',
    age: 35,
    gender: 'Non-binary',
    interests: ['Books', 'Photography'],
    location: 'London',
    isOnline: true,
    role: 'admin',
  },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox');
  
  const handleUserClick = (username: string) => {
    navigate(`/chat/${username}`);
    onClose();
  };
  
  const renderUserList = (users: UserProfile[]) => {
    return users.length === 0 ? (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No users to display
      </div>
    ) : (
      <div className="space-y-2 p-2">
        {users.map((user) => (
          <div
            key={user.username}
            className="glass-card p-3 cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleUserClick(user.username)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="font-medium truncate">{user.username}</p>
                  {user.role === 'vip' && (
                    <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent">
                      VIP
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded text-[10px] bg-destructive/20 text-destructive">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user.location} • {user.age}
                </p>
              </div>
              {user.isOnline && (
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-80 md:w-96 bg-background z-50 shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 gap-2 px-4 py-3">
            <TabsTrigger value="inbox" className="flex items-center gap-1.5">
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-1.5">
              <Ban className="h-4 w-4" />
              <span>Blocked</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="inbox" className="mt-0 h-full">
              {renderUserList(mockUsers.filter(user => user.isOnline))}
            </TabsContent>
            <TabsContent value="history" className="mt-0 h-full">
              {renderUserList(mockUsers)}
            </TabsContent>
            <TabsContent value="blocked" className="mt-0 h-full">
              <div className="p-4 text-center text-muted-foreground text-sm">
                No blocked users
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Sidebar;
