
import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { signalRService } from '@/services/signalRService';
import ChatWindow from '@/components/ChatWindow';
import { useCountryFlags } from '@/hooks/useCountryFlags';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  username: string;
  gender: string;
  age: number;
  location: string;
  interests: string[];
  isOnline: boolean;
  isVip?: boolean;
  isAdmin?: boolean;
}

const AdminChatInterface = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { countryFlags } = useCountryFlags();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Ensure admin is always connected
    if (currentUser) {
      // Start connection as admin
      signalRService.startConnection(
        999, // Special admin ID
        currentUser.username || 'Admin',
        'admin'
      );
      
      // Load mock users for the demo
      // In a real implementation, this would come from the server
      loadMockUsers();
    }
    
    return () => {
      // Don't disconnect for admins
    };
  }, [currentUser]);
  
  const loadMockUsers = () => {
    // This is a mock implementation - in production this would come from the server
    const mockUsers = [
      { id: 1, username: "Alice", gender: "Female", age: 28, location: "Australia", interests: ["Art", "Photography", "Travel"], isOnline: true, isVip: true },
      { id: 2, username: "Bob", gender: "Male", age: 35, location: "Canada", interests: ["Music", "Technology", "Gaming"], isOnline: false },
      { id: 3, username: "Clara", gender: "Female", age: 24, location: "United Kingdom", interests: ["Fashion", "Cooking", "Sports"], isOnline: true },
      { id: 4, username: "David", gender: "Male", age: 42, location: "France", interests: ["Cooking", "Books", "Music"], isOnline: true, isVip: true },
      { id: 5, username: "Elena", gender: "Female", age: 31, location: "Spain", interests: ["Sports", "Fashion", "Fitness"], isOnline: false },
      { id: 6, username: "Feng", gender: "Male", age: 27, location: "China", interests: ["Books", "Sports", "Technology"], isOnline: true },
      { id: 7, username: "Gabriela", gender: "Female", age: 29, location: "Brazil", interests: ["Sports", "Music", "Cooking"], isOnline: true, isVip: true },
      { id: 8, username: "Hiroshi", gender: "Male", age: 33, location: "Japan", interests: ["Technology", "Gaming", "Food"], isOnline: false },
      { id: 9, username: "Isabella", gender: "Female", age: 26, location: "Italy", interests: ["Fashion", "Food", "Art"], isOnline: true },
      { id: 10, username: "Jamal", gender: "Male", age: 30, location: "Egypt", interests: ["Books", "Sports", "Photography"], isOnline: true },
    ];
    
    setConnectedUsers(mockUsers);
  };
  
  const handleBackToAdmin = () => {
    navigate('/admin-dashboard');
  };
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
  };
  
  const filteredUsers = connectedUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackToAdmin}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Admin Chat Interface</h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* User sidebar */}
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Admin view of all users</span>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-180px)]">
            {filteredUsers.map(user => (
              <div 
                key={user.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedUser?.id === user.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{user.username}</span>
                        {user.isVip && (
                          <Badge variant="outline" className="ml-2 text-xs">VIP</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {countryFlags[user.location] && (
                          <img 
                            src={countryFlags[user.location]}
                            alt={`${user.location} flag`}
                            className="w-4 h-3 mr-1 object-cover"
                          />
                        )}
                        <span>{user.location}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No users found
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Chat window */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
          {selectedUser ? (
            <ChatWindow 
              user={selectedUser}
              countryFlags={countryFlags}
              onClose={handleCloseChat}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-6">
                <h2 className="text-xl font-semibold mb-2">Select a user to start chatting</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  As an admin, you have access to chat with all users
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatInterface;
