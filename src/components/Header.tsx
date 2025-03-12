
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, Settings, User, Moon, Sun, History } from 'lucide-react';

const Header = () => {
  const { currentUser, setCurrentUser, setIsLoggedIn, userRole } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  const showBackButton = location.pathname !== '/' && location.pathname !== '/user-selection';
  const showUserControls = currentUser && location.pathname !== '/';
  // Hide inbox and history buttons on specific pages
  const hideExtraButtons = location.pathname === '/profile-setup' || 
                          location.pathname === '/login' || 
                          location.pathname === '/register' ||
                          location.pathname === '/vip-membership';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 transition-all duration-300 ${
        scrolled ? 'glass shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="transition-all duration-300 hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="text-xl font-semibold flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Chatiwy
            </span>
          </Link>
        </div>

        {showUserControls ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium mr-2">
                {currentUser.username}
              </span>
              {userRole === 'vip' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent">
                  VIP
                </span>
              )}
              {userRole === 'admin' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/20 text-destructive">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center justify-center w-8 h-8">
              <User className="h-5 w-5" />
            </div>
            {userRole === 'admin' && (
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-300 hover:bg-white/20"
                onClick={() => navigate('/admin-dashboard')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="transition-all duration-300 hover:bg-white/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="transition-all duration-300 hover:bg-white/20"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {!hideExtraButtons && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 bg-gray-100/10"
                >
                  <img 
                    src="/lovable-uploads/e3b5491b-50db-4077-a99f-3de3837ccad6.png" 
                    alt="Inbox" 
                    className="h-4 w-4" 
                  />
                  Inbox
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 bg-gray-100/10"
                  onClick={() => navigate('/chat-history')}
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="transition-all duration-300 hover:bg-white/20"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {location.pathname === '/' && (
              <Button
                variant="ghost"
                className="transition-all duration-300 hover:bg-white/20"
                onClick={() => navigate('/vip-membership')}
              >
                VIP Membership
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
