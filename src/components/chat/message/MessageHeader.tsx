
import React from 'react';
import { UserRole } from '@/contexts/UserContext';
import UserTypeDisplay from '@/components/UserTypeDisplay';
import "@/styles/glow-animations.css"; // We'll create this CSS file next

interface MessageHeaderProps {
  sender: string;
  actualUsername?: string;
  senderRole?: UserRole;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  sender, 
  actualUsername,
  senderRole = 'standard'
}) => {
  // Always prioritize actualUsername if available, fall back to sender
  // This ensures we always show the real username, not a placeholder
  const displayName = actualUsername || sender;
  
  const getNameClasses = () => {
    if (senderRole === 'vip') {
      return 'vip-username';
    }
    if (senderRole === 'admin') {
      return 'admin-username';
    }
    return '';
  };
  
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium opacity-90 mb-1">
      <span className={getNameClasses()}>{displayName}</span>
      {senderRole && <UserTypeDisplay role={senderRole} showLabel={false} size="sm" />}
    </div>
  );
};

export default MessageHeader;
