
import React from 'react';

interface ReactionDisplayProps {
  reaction: string;
  isFromCurrentUser: boolean;
}

const ReactionDisplay: React.FC<ReactionDisplayProps> = ({
  reaction,
  isFromCurrentUser
}) => {
  return (
    <div className={`absolute ${isFromCurrentUser ? '-bottom-2 right-2' : '-bottom-2 left-2'}`}>
      <span className="text-lg bg-white dark:bg-gray-800 rounded-full px-1 py-0.5 shadow-sm">{reaction}</span>
    </div>
  );
};

export default ReactionDisplay;
