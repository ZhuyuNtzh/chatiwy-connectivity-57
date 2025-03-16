
import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface MessageReplySectionProps {
  replyToId: string;
  replyText?: string;
  isFromCurrentUser: boolean;
}

const MessageReplySection: React.FC<MessageReplySectionProps> = ({
  replyToId,
  replyText,
  isFromCurrentUser
}) => {
  const [displayText, setDisplayText] = useState<string>(replyText || "Previous message");
  
  // Try to get stored reply text from localStorage as a fallback
  useEffect(() => {
    if (!replyText) {
      const storedReplyText = localStorage.getItem(`replyText_${replyToId}`);
      if (storedReplyText) {
        setDisplayText(storedReplyText);
      }
    }
  }, [replyToId, replyText]);

  return (
    <div className={`mb-1 p-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg max-w-[80%] ${isFromCurrentUser ? 'ml-auto mr-6' : 'ml-6'}`}>
      <div className="flex items-center">
        <MessageSquare className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400">Replying to</span>
      </div>
      <div className="mt-0.5 line-clamp-2 text-gray-700 dark:text-gray-300">
        {displayText}
      </div>
    </div>
  );
};

export default MessageReplySection;
