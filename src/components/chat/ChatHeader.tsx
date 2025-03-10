
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, MoreVertical, Flag, Ban } from 'lucide-react';
import UserInfo from './UserInfo';

interface ChatHeaderProps {
  user: {
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  };
  countryFlags: Record<string, string>;
  onClose: () => void;
  onShowOptions: (show: boolean) => void;
  showOptions: boolean;
  onBlockUser: () => void;
  onReportUser: () => void;
  onShowBlockedUsers: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  countryFlags,
  onClose,
  showOptions,
  onShowOptions,
  onBlockUser,
  onReportUser,
  onShowBlockedUsers
}) => {
  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
      <UserInfo user={user} countryFlags={countryFlags} />
      
      <div className="flex items-center gap-2">
        <Popover open={showOptions} onOpenChange={onShowOptions}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={onBlockUser}
              >
                <Ban className="h-4 w-4 mr-2" />
                Block user
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                onClick={onReportUser}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report user
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                onClick={onShowBlockedUsers}
              >
                <Ban className="h-4 w-4 mr-2" />
                Blocked users
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
