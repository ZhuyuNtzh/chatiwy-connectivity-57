
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

interface NewMessageNotificationProps {
  count: number;
  onScrollToBottom: () => void;
}

const NewMessageNotification: React.FC<NewMessageNotificationProps> = ({ 
  count, 
  onScrollToBottom 
}) => {
  return (
    <div className="absolute bottom-4 right-4">
      <Button 
        onClick={onScrollToBottom}
        size="sm"
        className="rounded-full p-2 flex items-center gap-2"
      >
        <ArrowDown className="h-4 w-4" />
        {count > 1 ? `${count} new messages` : '1 new message'}
      </Button>
    </div>
  );
};

export default NewMessageNotification;
