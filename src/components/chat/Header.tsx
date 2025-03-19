
import { Button } from '@/components/ui/button';
import { User, LogOut, Moon, Sun, History, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  username: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  onHistory?: () => void;
  onInbox?: () => void;
  unreadCount?: number;
}

const Header = ({ 
  username, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout,
  onHistory,
  onInbox,
  unreadCount = 0
}: HeaderProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-10 py-3 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="hidden md:flex items-center">
          <img 
            src="/lovable-uploads/d8841acc-5cb4-4eb0-a83b-3a8d99e4eaf6.png" 
            alt="Chatwii Logo" 
            className="h-7"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {onHistory && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={onHistory}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          )}
          
          {onInbox && (
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={onInbox}
              >
                <Inbox className="h-4 w-4" />
                <span className="hidden sm:inline">Inbox</span>
              </Button>
              
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center ml-2 md:ml-4">
            <span className="hidden sm:inline text-sm font-medium mr-2">{username}</span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
              <User className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <div
            onClick={toggleDarkMode}
            className="ml-1 md:ml-2 p-2 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="ml-1 md:ml-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
