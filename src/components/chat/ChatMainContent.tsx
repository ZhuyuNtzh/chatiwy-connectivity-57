
import React from 'react';
import ChatInterfaceContent from './ChatInterfaceContent';

interface ChatMainContentProps {
  selectedUser: {
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  } | null;
  countryFlags: Record<string, string>;
  onCloseChat: () => void;
  isDarkMode: boolean;
}

const ChatMainContent: React.FC<ChatMainContentProps> = ({
  selectedUser,
  countryFlags,
  onCloseChat,
  isDarkMode
}) => {
  return (
    <div className="flex-1 md:ml-6 hidden md:block">
      <ChatInterfaceContent 
        selectedUser={selectedUser}
        countryFlags={countryFlags}
        onCloseChat={onCloseChat}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ChatMainContent;
