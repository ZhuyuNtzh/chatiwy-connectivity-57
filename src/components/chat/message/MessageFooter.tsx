
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageFooterProps {
  timestamp: Date;
  showMessageStatus?: boolean;
}

const MessageFooter: React.FC<MessageFooterProps> = ({ 
  timestamp, 
  showMessageStatus = false 
}) => {
  const renderMessageStatus = () => {
    if (!showMessageStatus) return null;
    
    // Simulate random statuses for demo
    const status = Math.random() > 0.7 ? 'read' : Math.random() > 0.4 ? 'delivered' : 'sent';
    
    return (
      <span className="ml-1">
        {status === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
        {status === 'delivered' && <CheckCheck className="h-3 w-3 text-gray-400" />}
        {status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
      </span>
    );
  };

  return (
    <div className="text-xs opacity-70 mt-1 text-right flex justify-end items-center">
      {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      {renderMessageStatus()}
    </div>
  );
};

export default MessageFooter;
