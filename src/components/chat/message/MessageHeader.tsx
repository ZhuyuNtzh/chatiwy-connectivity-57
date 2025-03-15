
import React from 'react';

interface MessageHeaderProps {
  sender: string;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ sender }) => {
  // Format sender name to remove any "User" prefix followed by a number
  const formatSenderName = (senderName: string) => {
    // If it matches pattern like "User123", extract just the name part
    if (/^User\d+$/.test(senderName)) {
      return senderName;
    }
    return senderName;
  };

  return (
    <div className="font-semibold text-sm mb-1 text-gray-700 dark:text-gray-300">
      {formatSenderName(sender)}
    </div>
  );
};

export default MessageHeader;
