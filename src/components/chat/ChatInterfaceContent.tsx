
import React from 'react';
import ChatWindow from '../ChatWindow';

interface ChatInterfaceContentProps {
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

const ChatInterfaceContent: React.FC<ChatInterfaceContentProps> = ({
  selectedUser,
  countryFlags,
  onCloseChat,
  isDarkMode
}) => {
  return (
    <div className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm h-full flex flex-col`}>
      {selectedUser ? (
        <ChatWindow 
          user={selectedUser}
          countryFlags={countryFlags}
          onClose={onCloseChat}
        />
      ) : (
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>
            Select a chat to start messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatInterfaceContent;
