
import React from 'react';
import ChatWindow from '../ChatWindow';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className={`h-[calc(100vh-5rem)] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm flex flex-col ${selectedUser ? 'block fixed inset-0 top-20 z-50 md:static md:z-auto' : 'hidden md:flex'}`}>
      {selectedUser ? (
        <ScrollArea className="h-full">
          <ChatWindow 
            user={selectedUser}
            countryFlags={countryFlags}
            onClose={onCloseChat}
          />
        </ScrollArea>
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
