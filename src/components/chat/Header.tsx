import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, SunMedium, LogOut, History, Inbox, User, Crown, UserCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from '@/contexts/UserContext';

interface HeaderProps {
  username: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  onHistory: () => void;
  onInbox: () => void;
}

const Header: React.FC<HeaderProps> = ({
  username,
  isDarkMode,
  toggleDarkMode,
  onLogout,
  onHistory,
  onInbox
}) => {
  
  const { userRole } = useUser();
  
  return (
    <header className={`sticky top-0 z-[100] w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border-b shadow-sm`}>
      <div className="container px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/a1551f2b-73e8-42c5-b33d-842ef4dd9fd8.png" alt="ChatWii Logo" className="h-10" />
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{username}</span>
            {userRole === 'vip' && (
              <span className="ml-1 inline-flex items-center">
                <Crown className="h-4 w-4 text-amber-400" />
              </span>
            )}
          </span>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9" 
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle dark mode</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={onInbox}
                >
                  <Inbox className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Inbox</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={onHistory}
                >
                  <History className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chat history</p>
              </TooltipContent>
            </Tooltip>
            
            {userRole === 'vip' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/vip-profile">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                    >
                      <UserCircle className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>VIP Profile</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default Header;
