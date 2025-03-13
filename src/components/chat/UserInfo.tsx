
import React from 'react';
import { User, Crown, Star } from 'lucide-react';
import UserTypeDisplay from '@/components/UserTypeDisplay';
import { UserRole } from '@/contexts/UserContext';

interface UserInfoProps {
  user: {
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isVip?: boolean;
    role?: UserRole;
  };
  countryFlags: Record<string, string>;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, countryFlags }) => {
  // Determine role from props
  const userRole = user.role || (user.isVip ? 'vip' : 'standard');
  
  const getUserIconBackground = () => {
    switch(userRole) {
      case 'admin':
        return 'bg-gradient-to-br from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600';
      case 'vip':
        return 'bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800';
      default:
        return 'bg-orange-100 dark:bg-orange-900/40';
    }
  };
  
  const getUsernameClass = () => {
    switch(userRole) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent';
      case 'vip':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-start">
      <div className={`mr-3 flex items-center justify-center w-10 h-10 rounded-full ${getUserIconBackground()}`}>
        <User className="h-6 w-6 text-white" />
      </div>
      
      <div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <h3 className={`font-medium ${getUsernameClass()}`}>
              {user.username}
            </h3>
            <div className="ml-1.5">
              <UserTypeDisplay role={userRole} size="sm" />
            </div>
          </div>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.gender}, {user.age}
          </span>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {countryFlags[user.location] && (
            <img 
              src={countryFlags[user.location]}
              alt={`${user.location} flag`}
              className="w-4 h-3 mr-1 object-cover"
            />
          )}
          <span>{user.location}</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {user.interests.map((interest, idx) => (
            <span 
              key={idx} 
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                userRole === 'vip' 
                  ? 'bg-gradient-to-r from-amber-100 to-orange-50 text-amber-800 dark:from-amber-900/60 dark:to-orange-900/60 dark:text-amber-200' 
                  : userRole === 'admin'
                    ? 'bg-gradient-to-r from-purple-100 to-pink-50 text-purple-800 dark:from-purple-900/60 dark:to-pink-900/60 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
