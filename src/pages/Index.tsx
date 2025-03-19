
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
import { Helmet } from 'react-helmet-async';

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
    <>
      <Helmet>
        <title>Secure 1-on-1 Chat Platform | Chatwii</title>
        <meta name="description" content="Chat anonymously or with verified users on our secure platform. Private, end-to-end encrypted messaging for safe online conversations." />
      </Helmet>
      
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
                  Private <span className="text-secondary">One-on-One</span> Chat
                </h1>
                <h2 className="text-4xl font-bold mb-6">
                  with <span className="text-primary">no registration</span>
                </h2>
                <p className="text-muted-foreground">
                  Connect securely with people from around the world. Our anonymous chat platform offers end-to-end encryption and privacy features that keep your conversations safe.
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
                    aria-label="Enter your username"
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
                  aria-label="Generate random username"
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
              </div>
              
              <Button 
                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white animate-pulse-subtle-hover"
                onClick={handleStartChat}
              >
                Start Secure Chat
              </Button>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>By starting a chat, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</p>
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-medium text-primary mb-2">Why Choose Chatwii?</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    <span>End-to-end encrypted messaging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    <span>No registration required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    <span>Private one-on-one conversations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-32 h-[530px] ad-placeholder animate-pulse-slow">
            Ad place holder
          </div>
        </main>

        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Features for Safe Online Chat</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Private Messaging</h3>
                <p className="text-muted-foreground">Enjoy secure one-on-one conversations with end-to-end encryption that keeps your chats private.</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Anonymous Chat</h3>
                <p className="text-muted-foreground">Chat without sharing personal information. No email or phone number required to start conversations.</p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-3">VIP Benefits</h3>
                <p className="text-muted-foreground">Upgrade to VIP for enhanced features like message history, media sharing, and verified status.</p>
              </div>
            </div>
          </div>
        </section>

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

        <footer className="w-full px-8 py-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4">About Chatwii</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Our Story</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Security Features</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Safety</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Safety Tips</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Report a User</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Settings</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Online Safety Guide</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Community Guidelines</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">GDPR Compliance</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-muted-foreground/20 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground mb-4 md:mb-0">© 2024 Chatwii. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Facebook</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
