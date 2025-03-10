
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useUser } from '@/contexts/UserContext';
import { Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn } = useUser();
  const [username, setUsername] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Sunny', 'Quick', 'Clever', 'Brave', 'Calm', 'Eager', 'Gentle'];
    const nouns = ['Fox', 'Tiger', 'Eagle', 'Panda', 'Dolphin', 'Wolf', 'Bear', 'Hawk'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const handleRandomize = () => {
    setUsername(generateRandomUsername());
  };

  const handleStartChat = () => {
    if (!username.trim()) {
      setUsername(generateRandomUsername());
      return;
    }

    setCurrentUser({
      username: username.trim(),
      role: 'standard'
    });
    setIsLoggedIn(true);
    navigate('/chat');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode in a real implementation
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-foreground">chativy.</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Dark mode</span>
            <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-md px-6">
            VIP Membership
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row px-4 md:px-8 py-6 gap-4">
        {/* Left side - Chat bubbles */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative">
          <div className="w-full max-w-md relative">
            <div className="chat-bubble chat-bubble-teal w-64 h-44 absolute top-0 left-0 transform rotate-6"></div>
            <div className="chat-bubble chat-bubble-red w-16 h-16 rounded-full absolute top-16 right-12"></div>
            <div className="chat-bubble chat-bubble-orange w-24 h-10 absolute top-8 right-24 transform -rotate-12"></div>
            <div className="chat-bubble chat-bubble-teal w-72 h-40 absolute bottom-8 right-4 transform -rotate-12"></div>
            <div className="chat-bubble chat-bubble-orange w-20 h-12 absolute bottom-32 left-12"></div>
            <div className="chat-bubble chat-bubble-red w-8 h-8 rounded-full absolute bottom-12 left-32"></div>
            <div className="chat-bubble chat-bubble-red w-4 h-4 rounded-full absolute bottom-24 left-8"></div>
            <div className="w-3 h-3 bg-primary rounded-full absolute top-1/3 right-1/3"></div>
          </div>
        </div>

        {/* Right side - Text and input */}
        <div className="w-full md:w-1/2 flex items-center">
          <div className="w-full max-w-lg bg-white rounded-2xl p-8 shadow-sm">
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
              <Input
                className="h-12"
                placeholder="Type your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
              className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white"
              onClick={handleStartChat}
            >
              Start Chat
            </Button>
          </div>
        </div>

        {/* Right side ad placeholder */}
        <div className="hidden lg:block w-32 h-[530px] ad-placeholder">
          Ad place holder
        </div>
      </main>

      {/* Bottom ad placeholder */}
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="w-full h-20 ad-placeholder mb-4">
          Ad place holder
        </div>
      </div>

      {/* Footer */}
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
