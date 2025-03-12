
import React from 'react';
import { User, Crown, Star } from 'lucide-react';

interface UserInfoProps {
  user: {
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isVip?: boolean;
  };
  countryFlags: Record<string, string>;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, countryFlags }) => {
  return (
    <div className="flex items-start">
      <div className={`mr-3 flex items-center justify-center w-10 h-10 rounded-full ${
        user.isVip ? 'bg-gradient-to-br from-amber-300 to-amber-500 dark:from-amber-600 dark:to-amber-800' : 'bg-orange-100 dark:bg-orange-900/40'
      }`}>
        <User className={`h-6 w-6 ${user.isVip ? 'text-white' : 'text-orange-600 dark:text-orange-300'}`} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <h3 className={`font-medium ${user.isVip ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent' : ''}`}>
              {user.username}
            </h3>
            {user.isVip && (
              <span className="ml-1.5 inline-flex items-center">
                <Crown className="h-4 w-4 text-amber-400 dark:text-amber-300" />
              </span>
            )}
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
                user.isVip 
                  ? 'bg-gradient-to-r from-amber-100 to-orange-50 text-amber-800 dark:from-amber-900/60 dark:to-orange-900/60 dark:text-amber-200' 
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
