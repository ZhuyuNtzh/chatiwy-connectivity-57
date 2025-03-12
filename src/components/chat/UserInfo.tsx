
import React from 'react';
import { User, Crown } from 'lucide-react';

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
      <div className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
        <User className="h-6 w-6 text-orange-600" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <h3 className="font-medium">{user.username}</h3>
            {user.isVip && (
              <span className="ml-1.5 inline-flex items-center">
                <Crown className="h-4 w-4 text-amber-400" />
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {user.gender}, {user.age}
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-0.5">
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
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
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
