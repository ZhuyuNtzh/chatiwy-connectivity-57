
import { Button } from '@/components/ui/button';
import { User, LogOut, Moon, Sun, History, Inbox } from 'lucide-react';

interface HeaderProps {
  username: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  onHistory?: () => void;
  onInbox?: () => void;
}

const Header = ({ 
  username, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout,
  onHistory,
  onInbox
}: HeaderProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-10 py-3 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            Chatiwy
          </span>
        </div>
        
        <div className="flex items-center gap-2">
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
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={onInbox}
            >
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Inbox</span>
            </Button>
          )}
          
          <div className="flex items-center ml-4">
            <span className="text-sm font-medium mr-2">{username}</span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
              <User className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="ml-2"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="ml-2"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
