
import { useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Image as ImageIcon, Flag, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUser, UserRole } from '../contexts/UserContext';

interface ChatMessageProps {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isMine: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isImage?: boolean;
  imageUrl?: string;
  isBlurred?: boolean;
  senderRole?: UserRole;
}

const ChatMessage = ({
  id,
  content,
  sender,
  timestamp,
  isMine,
  status = 'sent',
  isImage = false,
  imageUrl,
  isBlurred = false,
  senderRole = 'standard'
}: ChatMessageProps) => {
  const { userRole } = useUser();
  const [blurred, setBlurred] = useState(isBlurred);
  
  const roleColorClass = () => {
    if (senderRole === 'admin') return 'bg-chat-admin';
    if (senderRole === 'vip') return 'bg-chat-vip';
    return 'bg-chat-standard';
  };
  
  const myColorClass = 'bg-chat-user text-white';
  
  const statusIcon = () => {
    if (status === 'read') return <CheckCheck className="h-3 w-3" />;
    if (status === 'delivered') return <Check className="h-3 w-3" />;
    return <Check className="h-3 w-3 opacity-50" />;
  };
  
  const toggleBlur = () => {
    if (blurred) {
      setBlurred(false);
    } else {
      setBlurred(true);
    }
  };
  
  const handleReport = () => {
    // Handle report functionality
    console.log(`Reported message ${id}`);
  };
  
  const handleBlock = () => {
    // Handle block functionality
    console.log(`Blocked user ${sender}`);
  };

  return (
    <div className={`flex max-w-full ${isMine ? 'justify-end' : 'justify-start'} mb-3 group`}>
      <div className={`relative max-w-[80%] md:max-w-[70%] px-4 py-2 rounded-2xl ${isMine ? myColorClass : roleColorClass()} shadow-sm transition-all duration-300`}>
        {!isMine && (
          <div className="text-xs font-medium opacity-70 mb-0.5">{sender}</div>
        )}
        
        {isImage ? (
          <div className="relative rounded-lg overflow-hidden border border-white/20">
            <img 
              src={imageUrl} 
              alt="Shared image" 
              className={`max-w-full h-auto transition-all duration-300 ${blurred ? 'blur-lg' : ''}`}
            />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleBlur}
                className="bg-black/30 hover:bg-black/50 text-white border-white/20"
              >
                {blurred ? 'Reveal' : 'Blur'}
                <ImageIcon className="ml-1.5 h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm">{content}</div>
        )}
        
        <div className={`flex items-center text-xs mt-1 space-x-1 opacity-60 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span>{format(timestamp, 'HH:mm')}</span>
          {isMine && (userRole === 'vip' || userRole === 'admin') && (
            <span>{statusIcon()}</span>
          )}
        </div>
        
        {!isMine && (
          <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-6 w-6 rounded-full bg-white/90 hover:bg-white shadow-sm"
                    onClick={handleReport}
                  >
                    <Flag className="h-3 w-3 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Report message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-6 w-6 rounded-full bg-white/90 hover:bg-white shadow-sm"
                    onClick={handleBlock}
                  >
                    <Ban className="h-3 w-3 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Block user</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
