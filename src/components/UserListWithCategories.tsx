
import React, { useState, useMemo } from 'react';
import { UserProfile } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserCard from './UserCard';
import UserTypeDisplay from './UserTypeDisplay';
import { Search, Users, Shield, Crown } from 'lucide-react';

interface UserListWithCategoriesProps {
  users: UserProfile[];
  onUserSelect?: (user: UserProfile) => void;
  showSearch?: boolean;
  maxHeight?: string;
  className?: string;
}

const UserListWithCategories = ({
  users,
  onUserSelect,
  showSearch = true,
  maxHeight = '400px',
  className = ''
}: UserListWithCategoriesProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // First filter by tab
      if (activeTab === 'admin' && user.role !== 'admin') return false;
      if (activeTab === 'vip' && user.role !== 'vip') return false;
      if (activeTab === 'standard' && user.role !== 'standard') return false;
      if (activeTab === 'online' && !user.isOnline) return false;
      
      // Then filter by search term
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchLower) ||
        (user.location?.toLowerCase().includes(searchLower)) ||
        (user.interests?.some(interest => 
          interest.toLowerCase().includes(searchLower)
        ))
      );
    });
  }, [users, activeTab, searchTerm]);
  
  // Count users by type
  const counts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      vip: users.filter(u => u.role === 'vip').length,
      standard: users.filter(u => u.role === 'standard').length,
      online: users.filter(u => u.isOnline).length
    };
  }, [users]);
  
  return (
    <div className={className}>
      {showSearch && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or interests"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            <Users className="h-4 w-4 mr-1" />
            <span>All ({counts.all})</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex-1">
            <Shield className="h-4 w-4 mr-1" />
            <span>Admin ({counts.admin})</span>
          </TabsTrigger>
          <TabsTrigger value="vip" className="flex-1">
            <Crown className="h-4 w-4 mr-1" />
            <span>VIP ({counts.vip})</span>
          </TabsTrigger>
          <TabsTrigger value="standard" className="flex-1">
            <span>Standard ({counts.standard})</span>
          </TabsTrigger>
          <TabsTrigger value="online" className="flex-1">
            <span>Online ({counts.online})</span>
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className={`mt-4`} style={{ maxHeight }}>
          <div className="space-y-3 pr-4">
            {filteredUsers.map((user, index) => (
              <div 
                key={`${user.username}-${index}`}
                onClick={() => onUserSelect && onUserSelect(user)}
                className={onUserSelect ? 'cursor-pointer' : ''}
              >
                <UserCard user={user} />
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default UserListWithCategories;
