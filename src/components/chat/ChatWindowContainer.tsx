
import React from 'react';

interface ChatWindowContainerProps {
  children: React.ReactNode;
}

const ChatWindowContainer: React.FC<ChatWindowContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 h-full w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
      {children}
    </div>
  );
};

export default ChatWindowContainer;
