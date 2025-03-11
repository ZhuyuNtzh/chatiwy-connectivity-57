
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
    <div className={`h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden flex flex-col`}>
      <div className="p-4 flex-shrink-0">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        
        <div className="mt-6 flex items-center justify-between">
          <h2 className={`text-lg font-semibold text-[#FB9E41]`}>
            People <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({connectedUsersCount})</span>
          </h2>
          <FiltersDropdown onFiltersChange={onFiltersChange} />
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <UserList
          users={users}
          selectedUserId={selectedUserId}
          countryFlags={countryFlags}
          onUserClick={onUserClick}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};

export default ChatSidebar;
