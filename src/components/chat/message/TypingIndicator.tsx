
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-700">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="text-xs opacity-70 mt-1 text-gray-500 dark:text-gray-400">typing...</div>
      </div>
    </div>
  );
};

export default TypingIndicator;
