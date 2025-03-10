
import { Button } from "@/components/ui/button";
import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  username: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const Header = ({ username, isDarkMode, toggleDarkMode, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className={`fixed top-0 left-0 right-0 h-16 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex items-center justify-between px-4 md:px-6`}>
      <div className="flex-1">
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>chativy.</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-2 bg-gray-200 hover:bg-gray-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : ''}`}
          onClick={() => navigate('/chat-history')}
        >
          <History className="h-5 w-5" />
          <span>History</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Dark mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDarkMode ? 'bg-primary' : 'bg-gray-200'
            }`}
            onClick={toggleDarkMode}
          >
            <span
              className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isDarkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{username}</span>
        </div>
        
        <Button 
          onClick={onLogout}
          variant="destructive"
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
