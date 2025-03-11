
import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserListProps {
  users: Array<{
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  }>;
  selectedUserId: number | null;
  countryFlags: Record<string, string>;
  onUserClick: (user: UserListProps['users'][0]) => void;
  isDarkMode: boolean;
}

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

const UserList: React.FC<UserListProps> = ({ 
  users, 
  selectedUserId, 
  countryFlags, 
  onUserClick,
  isDarkMode 
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map(user => (
          <div 
            key={user.id} 
            className={`p-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition cursor-pointer ${
              selectedUserId === user.id ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : (isDarkMode ? 'bg-gray-800' : 'bg-white')
            }`}
            onClick={() => onUserClick(user)}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                  <UserIcon className="h-6 w-6 text-orange-600" />
                </div>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800" />
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
  );
};

export default UserList;
