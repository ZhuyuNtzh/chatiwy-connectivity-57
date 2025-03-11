
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import Header from '../components/chat/Header';
import RulesModal from '../components/RulesModal';
import LogoutDialog from '../components/chat/LogoutDialog';
import HistoryDialog from '../components/chat/HistoryDialog';
import InboxDialog from '../components/chat/InboxDialog';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatInterfaceContent from '../components/chat/ChatInterfaceContent';
import { useChatInterface } from '../hooks/useChatInterface';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockUsers = [
  { id: 1, username: "Alice", gender: "Female", age: 28, location: "Australia", interests: ["Art", "Photography", "Travel"], isOnline: true },
  { id: 2, username: "Bob", gender: "Male", age: 35, location: "Canada", interests: ["Music", "Technology", "Gaming"], isOnline: false },
  { id: 3, username: "Clara", gender: "Female", age: 24, location: "United Kingdom", interests: ["Fashion", "Cooking", "Sports"], isOnline: true },
  { id: 4, username: "David", gender: "Male", age: 42, location: "France", interests: ["Cooking", "Books", "Music"], isOnline: true },
  { id: 5, username: "Elena", gender: "Female", age: 31, location: "Spain", interests: ["Sports", "Fashion", "Fitness"], isOnline: false },
  { id: 6, username: "Feng", gender: "Male", age: 27, location: "China", interests: ["Books", "Sports", "Technology"], isOnline: true },
  { id: 7, username: "Gabriela", gender: "Female", age: 29, location: "Brazil", interests: ["Sports", "Music", "Cooking"], isOnline: true },
  { id: 8, username: "Hiroshi", gender: "Male", age: 33, location: "Japan", interests: ["Technology", "Gaming", "Food"], isOnline: false },
  { id: 9, username: "Isabella", gender: "Female", age: 26, location: "Italy", interests: ["Fashion", "Food", "Art"], isOnline: true },
  { id: 10, username: "Jamal", gender: "Male", age: 30, location: "Egypt", interests: ["Books", "Sports", "Photography"], isOnline: true },
  { id: 11, username: "TravelBot", gender: "Male", age: 25, location: "Singapore", interests: ["Travel", "Photography", "Food"], isOnline: true },
  { id: 12, username: "FitnessGuru", gender: "Female", age: 30, location: "Sweden", interests: ["Fitness", "Cooking", "Health"], isOnline: true },
  { id: 13, username: "BookWorm", gender: "Male", age: 28, location: "Germany", interests: ["Books", "Writing", "Movies"], isOnline: true },
  { id: 14, username: "TechGeek", gender: "Female", age: 32, location: "South Korea", interests: ["Technology", "Gaming", "Music"], isOnline: true },
  { id: 15, username: "ArtLover", gender: "Male", age: 27, location: "Mexico", interests: ["Art", "Photography", "Fashion"], isOnline: true },
];

const ChatInterface = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  const {
    searchTerm,
    setSearchTerm,
    isRulesModalOpen,
    setIsRulesModalOpen,
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
    countryFlags,
    selectedUser,
    connectedUsersCount,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    chatHistory,
    showInbox,
    setShowInbox,
    inboxMessages,
    filteredUsers,
    handleLogout,
    confirmLogout,
    cancelLogout,
    handleRulesAccepted,
    handleFiltersChange,
    handleUserClick,
    handleCloseChat,
    handleShowHistory,
    handleShowInbox,
    handleContinueChat
  } = useChatInterface(mockUsers);

  const handleMobileUserClick = (user: any) => {
    handleUserClick(user);
    // Don't close the sidebar automatically on mobile
  };

  // Create a handler that doesn't close the sidebar for filter changes
  const handleMobileFiltersChange = (filters: any) => {
    handleFiltersChange(filters);
    // Don't close the sidebar when applying filters
  };

  // Only close sidebar when clicking the close button or clicking outside the sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f2f7f9]'}`}>
      <Header 
        username={currentUser?.username || "Nickname"}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        onHistory={handleShowHistory}
        onInbox={handleShowInbox}
      />
      
      <div className="fixed top-16 bottom-0 left-0 right-0 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="h-full relative flex">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50 bg-white/90 dark:bg-gray-800/90 shadow-md border border-gray-200 dark:border-gray-700"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            {!isSidebarOpen && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white"></span>
            )}
          </Button>

          <div 
            className={`
              fixed md:relative
              top-0 bottom-0 left-0
              w-80 md:w-1/3
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
              z-40
              bg-white dark:bg-gray-800 shadow-lg
            `}
          >
            <ChatSidebar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              connectedUsersCount={connectedUsersCount}
              onFiltersChange={handleMobileFiltersChange}
              users={filteredUsers}
              selectedUserId={selectedUser?.id || null}
              countryFlags={countryFlags}
              onUserClick={handleMobileUserClick}
              isDarkMode={isDarkMode}
            />

            <Button
              variant="outline"
              size="icon"
              className="md:hidden absolute top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
              onClick={handleCloseSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 md:ml-6">
            <ChatInterfaceContent 
              selectedUser={selectedUser}
              countryFlags={countryFlags}
              onCloseChat={() => {
                handleCloseChat();
                // Do not close sidebar automatically when closing chat
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
      
      {!isSidebarOpen && (
        <div 
          className="md:hidden fixed top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-r-md shadow-md z-30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setIsSidebarOpen(true)}
          onTouchStart={() => setIsSidebarOpen(true)}
          style={{ width: '20px', height: '120px' }}
        >
          <div className="h-full w-1 mx-auto bg-gray-400 rounded-full"></div>
        </div>
      )}
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={(e) => {
            // Only close if clicking directly on the backdrop, not on its children
            if (e.target === e.currentTarget) {
              setIsSidebarOpen(false);
            }
          }}
        />
      )}
      
      <RulesModal 
        open={isRulesModalOpen} 
        onOpenChange={setIsRulesModalOpen} 
        onAccept={handleRulesAccepted}
      />

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
      
      <HistoryDialog 
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        chatHistory={chatHistory}
        users={mockUsers}
        onContinueChat={handleContinueChat}
      />
      
      <InboxDialog
        isOpen={showInbox}
        onOpenChange={setShowInbox}
        inboxMessages={inboxMessages}
        onOpenChat={handleContinueChat}
      />
    </div>
  );
};

export default ChatInterface;
