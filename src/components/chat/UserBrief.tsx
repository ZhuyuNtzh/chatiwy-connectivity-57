
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserBriefProps {
  username: string;
  age: number;
  gender: string;
  location?: string;
  interests: string[];
  countryFlags: Record<string, string>;
}

const UserBrief: React.FC<UserBriefProps> = ({
  username,
  age,
  gender,
  location,
  interests,
  countryFlags
}) => {
  return (
    <div>
      <div className="flex items-center">
        <h2 className="text-base font-medium">{username}</h2>
        {interests.length > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {interests[0]}
          </Badge>
        )}
      </div>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <span className="mr-1">{age} • {gender}</span>
        {location && countryFlags[location] && (
          <div className="flex items-center">
            <span className="mx-1">•</span>
            <img 
              src={countryFlags[location]} 
              alt={location}
              className="h-3 w-4 object-cover mr-1"
            />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBrief;
