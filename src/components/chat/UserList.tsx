
import React from 'react';
import { User as UserIcon, Crown, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserListProps {
  users: Array<{
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
    isVip?: boolean;
    isAdmin?: boolean;
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
  // Sort users: admins first, then VIPs, then by location/username
  const sortedUsers = [...users].sort((a, b) => {
    // Admins always come first
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    
    // Then VIPs
    if (a.isVip && !b.isVip) return -1;
    if (!a.isVip && b.isVip) return 1;
    
    // Then by location
    const countryCompare = a.location.localeCompare(b.location);
    if (countryCompare !== 0) return countryCompare;
    
    // Finally by username
    return a.username.localeCompare(b.username);
  });

  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {sortedUsers.map(user => (
        <div 
          key={user.id} 
          className={`p-2 md:p-4 cursor-pointer transition-colors ${
            selectedUserId === user.id 
              ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') 
              : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
          } ${
            user.isAdmin
              ? (isDarkMode 
                  ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-l-4 border-pink-500' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-pink-500')
              : user.isVip 
                ? (isDarkMode 
                    ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-l-4 border-amber-400' 
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400')
                : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUserClick(user);
          }}
        >
          <div className="flex items-start gap-2 md:gap-3">
            <div className="relative flex-shrink-0">
              <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${
                user.isAdmin ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 
                user.isVip ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-orange-100'
              }`}>
                {user.isAdmin ? (
                  <Shield className="h-5 w-5 md:h-6 md:w-6 text-pink-600" />
                ) : (
                  <UserIcon className={`h-5 w-5 md:h-6 md:w-6 ${user.isVip ? 'text-amber-600' : 'text-orange-600'}`} />
                )}
              </div>
              {user.isOnline && (
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className={`text-sm md:text-base font-medium ${
                  user.isAdmin 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500' 
                    : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.username}
                </h3>
                {user.isAdmin && (
                  <Badge variant="admin" className="ml-1.5">Admin</Badge>
                )}
                {user.isVip && !user.isAdmin && (
                  <span className="ml-1.5 inline-flex items-center">
                    <Crown className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-400" />
                  </span>
                )}
              </div>
              
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5 md:mt-1 flex items-center`}>
                {countryFlags[user.location] && (
                  <img 
                    src={countryFlags[user.location]}
                    alt={`${user.location} flag`}
                    className="w-4 h-3 md:w-5 md:h-4 mr-1 object-cover"
                  />
                )}
                <span>{user.location}</span>
              </p>
              
              <div className="mt-1 md:mt-2 flex flex-wrap gap-0.5 md:gap-1">
                {user.interests.slice(0, 3).map((interest, idx) => (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center px-1.5 md:px-2.5 py-0.5 rounded text-[10px] md:text-xs font-medium ${getInterestColor(interest)}`}
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 3 && (
                  <span className="inline-flex items-center px-1.5 md:px-2.5 py-0.5 rounded text-[10px] md:text-xs font-medium bg-gray-100 text-gray-700">
                    +{user.interests.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
