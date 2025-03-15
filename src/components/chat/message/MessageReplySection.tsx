
import React from 'react';
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
  return (
    <div className={`mb-1 p-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg max-w-[80%] ${isFromCurrentUser ? 'ml-auto mr-6' : 'ml-6'}`}>
      <div className="flex items-center">
        <MessageSquare className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400">Replying to</span>
      </div>
      <div className="mt-0.5 line-clamp-1">{replyText || "Previous message"}</div>
    </div>
  );
};

export default MessageReplySection;
