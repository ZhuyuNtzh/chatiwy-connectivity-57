
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

  const { currentUser } = useUser();

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
        <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChatSidebar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            connectedUsersCount={connectedUsersCount}
            onFiltersChange={handleFiltersChange}
            users={filteredUsers}
            selectedUserId={selectedUser?.id || null}
            countryFlags={countryFlags}
            onUserClick={handleUserClick}
            isDarkMode={isDarkMode}
          />
          
          <ChatInterfaceContent 
            selectedUser={selectedUser}
            countryFlags={countryFlags}
            onCloseChat={handleCloseChat}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      
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
      />
    </div>
  );
};

export default ChatInterface;
