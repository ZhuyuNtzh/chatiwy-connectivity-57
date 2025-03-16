
import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageFooterProps {
  timestamp: Date;
  showMessageStatus?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
}

const MessageFooter: React.FC<MessageFooterProps> = ({
  timestamp,
  showMessageStatus = false,
  status = 'sent'
}) => {
  const statusIcon = () => {
    if (status === 'read') return <CheckCheck className="h-3 w-3" />;
    if (status === 'delivered') return <Check className="h-3 w-3" />;
    if (status === 'failed') return <span className="text-xs text-red-500">!</span>;
    return <Check className="h-3 w-3 opacity-50" />;
  };

  return (
    <div className="flex items-center text-xs mt-1 space-x-1 opacity-60 justify-end">
      <span>{format(new Date(timestamp), 'HH:mm')}</span>
      {showMessageStatus && <span>{statusIcon()}</span>}
    </div>
  );
};

export default MessageFooter;
