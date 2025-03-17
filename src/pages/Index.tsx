
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Shuffle, LogIn, UserPlus, Moon, Sun } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Sunny', 'Quick', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle'];
    const nouns = ['Fox', 'Tiger', 'Eagle', 'Panda', 'Dolphin', 'Wolf', 'Bear', 'Hawk'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const validateNickname = (value: string): boolean => {
    const adminPattern = /admin/i;
    if (adminPattern.test(value)) {
      return false;
    }
    
    const consecutiveNumbersPattern = /\d{4,}/;
    if (consecutiveNumbersPattern.test(value)) {
      return false;
    }
    
    const alphanumericPattern = /^[a-zA-Z0-9]*$/;
    if (!alphanumericPattern.test(value)) {
      return false;
    }
    
    return true;
  };

  const handleRandomize = () => {
    setUsername(generateRandomUsername());
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.length <= 20) {
      if (value === '' || validateNickname(value)) {
        setUsername(value);
      } else {
        if (/admin/i.test(value)) {
          toast({
            title: "Invalid nickname",
            description: "The word 'admin' is not allowed in any form",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Invalid nickname",
            description: "Nickname must be alphanumeric with no more than 3 consecutive numbers",
            variant: "destructive"
          });
        }
      }
    } else {
      toast({
        title: "Nickname too long",
        description: "Standard users can have up to 20 characters",
        variant: "destructive"
      });
    }
  };

  const handleStartChat = () => {
    // If no username is provided, generate a random one
    const finalUsername = username.trim() || generateRandomUsername();
    
    if (!validateNickname(finalUsername)) {
      toast({
        title: "Invalid nickname",
        description: "Nickname must be alphanumeric with no more than 3 consecutive numbers",
        variant: "destructive"
      });
      return;
    }

    // Set the username in the current user so it's available in ProfileSetup
    setCurrentUser({
      username: finalUsername,
      role: 'standard'
    });
    setIsLoggedIn(true);
    
    navigate('/profile-setup');
    
    toast({
      title: "Welcome!",
      description: "Let's set up your profile"
    });
  };
  
  const handleVipClick = () => {
    setShowAuthDialog(true);
  };

  const handleVipLogin = () => {
    setShowAuthDialog(false);
    navigate('/login');
  };

  const handleVipRegister = () => {
    setShowAuthDialog(false);
    navigate('/vip-membership');
  };

  return (
    <div className={`min-h-screen bg-background flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <header className="w-full px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/d8841acc-5cb4-4eb0-a83b-3a8d99e4eaf6.png" 
            alt="Chatwii Logo" 
            className="h-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-primary"
            />
            {isDarkMode ? (
              <Moon size={16} className="text-foreground" />
            ) : (
              <Sun size={16} className="text-foreground" />
            )}
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white rounded-md"
            onClick={handleVipClick}
          >
            <span className="hidden md:inline">VIP Membership</span>
            <span className="md:hidden">VIP</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row px-4 md:px-8 py-6 gap-4">
        <div className="w-full md:w-1/2 hidden md:flex items-center justify-center relative">
          <div className="w-full max-w-md relative">
            <div className="chat-bubble chat-bubble-teal w-64 h-44 absolute top-0 left-0 transform rotate-6 animate-float-slow"></div>
            <div className="chat-bubble chat-bubble-red w-16 h-16 rounded-full absolute top-16 right-12 animate-pulse-subtle"></div>
            <div className="chat-bubble chat-bubble-orange w-24 h-10 absolute top-8 right-24 transform -rotate-12 animate-float"></div>
            <div className="chat-bubble chat-bubble-teal w-72 h-40 absolute bottom-8 right-4 transform -rotate-12 animate-float-reverse"></div>
            <div className="chat-bubble chat-bubble-orange w-20 h-12 absolute bottom-32 left-12 animate-pulse-slow"></div>
            <div className="chat-bubble chat-bubble-red w-8 h-8 rounded-full absolute bottom-12 left-32 animate-bounce-subtle"></div>
            <div className="chat-bubble chat-bubble-red w-4 h-4 rounded-full absolute bottom-24 left-8 animate-ping-subtle"></div>
            <div className="w-3 h-3 bg-primary rounded-full absolute top-1/3 right-1/3 animate-pulse"></div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center">
          <div className="w-full max-w-lg bg-card rounded-2xl p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                Text <span className="text-secondary">Anonymously</span>
              </h1>
              <h2 className="text-4xl font-bold mb-6">
                with <span className="text-primary">no registration</span>
              </h2>
              <p className="text-muted-foreground">
                Unleash your creativity and connect with like-minded individuals on our chatting website, 
                where conversations come to life.
              </p>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Input
                  className="h-12 pr-16"
                  placeholder="Type your name"
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={20}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {username.length}/20
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 border-input"
                onClick={handleRandomize}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            </div>
            
            <Button 
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white animate-pulse-subtle-hover"
              onClick={handleStartChat}
            >
              Start Chat
            </Button>
          </div>
        </div>

        <div className="hidden lg:block w-32 h-[530px] ad-placeholder animate-pulse-slow">
          Ad place holder
        </div>
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Choose an option</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col h-auto py-4"
              onClick={handleVipLogin}
            >
              <LogIn className="h-10 w-10 mb-2" />
              <span>Login</span>
              <span className="text-xs text-muted-foreground mt-1">Already a VIP member</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto py-4"
              onClick={handleVipRegister}
            >
              <UserPlus className="h-10 w-10 mb-2" />
              <span>Register</span>
              <span className="text-xs text-muted-foreground mt-1">New to VIP</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="w-full h-20 ad-placeholder mb-4 animate-pulse-subtle">
          Ad place holder
        </div>
      </div>

      <footer className="w-full px-8 py-4 flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground transition-colors">Terms & Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact us</a>
          <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
