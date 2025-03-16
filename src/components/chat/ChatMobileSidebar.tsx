
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import ChatSidebar from './ChatSidebar';

interface ChatMobileSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: (e?: React.MouseEvent) => void;
  closeSidebar: (e?: React.MouseEvent) => void;
  sidebarRef: React.RefObject<HTMLDivElement>;
  handleContentClick: (e: React.MouseEvent) => void;
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

const ChatMobileSidebar: React.FC<ChatMobileSidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
  sidebarRef,
  handleContentClick,
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
  const handleUserSelection = (user: any) => {
    onUserClick(user);
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  const handleSwipeOpen = () => {
    toggleSidebar();
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-[9999] bg-white/90 dark:bg-gray-800/90 shadow-md border border-gray-200 dark:border-gray-700"
        onClick={toggleSidebar}
        aria-label="Toggle user sidebar"
      >
        <Menu className="h-5 w-5" />
        {!isSidebarOpen && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
        )}
      </Button>

      <div 
        ref={sidebarRef}
        className={`
          fixed md:relative
          top-0 bottom-0 left-0
          w-80 md:w-1/3
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          z-40
          bg-white dark:bg-gray-800 shadow-lg
        `}
        onClick={handleContentClick}
      >
        <ChatSidebar 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          connectedUsersCount={connectedUsersCount}
          onFiltersChange={onFiltersChange}
          users={users}
          selectedUserId={selectedUserId}
          countryFlags={countryFlags}
          onUserClick={handleUserSelection}
          isDarkMode={isDarkMode}
        />

        <Button
          variant="outline"
          size="icon"
          className="md:hidden absolute top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
          onClick={closeSidebar}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {!isSidebarOpen && (
        <div 
          className="md:hidden fixed top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-r-md shadow-md z-30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={handleSwipeOpen}
          style={{ width: '20px', height: '120px' }}
        >
          <div className="h-full w-1 mx-auto bg-gray-400 rounded-full"></div>
        </div>
      )}
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSidebar(e);
            }
          }}
        />
      )}
    </>
  );
};

export default ChatMobileSidebar;
