
import React from 'react';

interface UserAvatarProps {
  username: string;
  isOnline: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  isOnline
}) => {
  return (
    <div className="relative mr-3">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-primary font-medium text-lg">
        {username.charAt(0).toUpperCase()}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
      )}
    </div>
  );
};

export default UserAvatar;
