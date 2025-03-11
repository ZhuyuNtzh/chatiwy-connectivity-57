
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchBar from './SearchBar';
import FiltersDropdown from '../FiltersDropdown';
import UserList from './UserList';

interface ChatSidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  connectedUsersCount: number;
  onFiltersChange: (filters: any) => void;
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
  onUserClick: (user: any) => void;
  isDarkMode: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  searchTerm,
  onSearchChange,
  connectedUsersCount,
  onFiltersChange,
  users,
  selectedUserId,
  countryFlags,
  onUserClick,
  isDarkMode
}) => {
  return (
    <div 
      className={`h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm flex flex-col border-r border-gray-200 dark:border-gray-700`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 p-4 bg-inherit">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        
        <div className="mt-6 flex items-center justify-between">
          <h2 className={`text-lg font-semibold text-[#FB9E41]`}>
            People <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({connectedUsersCount})</span>
          </h2>
          <div className="relative z-50">
            <FiltersDropdown onFiltersChange={onFiltersChange} />
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <UserList
          users={users}
          selectedUserId={selectedUserId}
          countryFlags={countryFlags}
          onUserClick={onUserClick}
          isDarkMode={isDarkMode}
        />
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
