
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  User,
  Moon,
  Sun,
  History,
  LogOut
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { currentUser, isLoggedIn } = useUser();
  const { handleLogout, confirmLogout, cancelLogout } = useAuthActions();
  const navigate = useNavigate();
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const onLogoutClick = () => {
    if (handleLogout()) {
      setShowLogoutDialog(true);
    }
  };
  
  const onConfirmLogout = () => {
    confirmLogout();
    setShowLogoutDialog(false);
  };
  
  const onCancelLogout = () => {
    cancelLogout();
    setShowLogoutDialog(false);
  };
  
  return (
    <header className="bg-background border-b border-input sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="hidden md:block">
          <Link to="/" className="text-xl font-bold text-foreground">
            chatwii.
          </Link>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-4">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate('/chat-interface')}>
                <User className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate('/chat-history')}>
                <History className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={onLogoutClick}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
          
          <div className="flex items-center">
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-primary"
            />
            {isDarkMode ? (
              <Moon size={16} className="ml-2 text-foreground" />
            ) : (
              <Sun size={16} className="ml-2 text-foreground" />
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Log out</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out? You will be redirected to the feedback page.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={onCancelLogout}>
              Cancel
            </Button>
            <Button onClick={onConfirmLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
