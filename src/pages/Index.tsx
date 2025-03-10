
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Moon, Search, Settings, User } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn } = useUser();
  const [selectedTab, setSelectedTab] = useState('messages');

  const handleLogin = () => {
    // Temporary login functionality - will be replaced with proper auth later
    setCurrentUser({
      username: 'Guest User',
      role: 'standard'
    });
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div className="w-20 bg-secondary flex flex-col items-center py-6">
        <div className="mb-10">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            C
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col items-center gap-6">
          <button 
            className={`p-2 rounded-xl transition-colors ${selectedTab === 'messages' ? 'bg-background text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSelectedTab('messages')}
          >
            <MessageCircle size={24} />
          </button>
          <button 
            className={`p-2 rounded-xl transition-colors ${selectedTab === 'contacts' ? 'bg-background text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSelectedTab('contacts')}
          >
            <User size={24} />
          </button>
          <button 
            className={`p-2 rounded-xl transition-colors ${selectedTab === 'search' ? 'bg-background text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSelectedTab('search')}
          >
            <Search size={24} />
          </button>
        </nav>
        
        <div className="mt-auto flex flex-col items-center gap-6">
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Moon size={24} />
          </button>
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={24} />
          </button>
          {currentUser ? (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-medium">{currentUser.username.charAt(0)}</span>
              )}
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <User size={18} className="text-primary" />
            </button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="text-center max-w-3xl mx-auto fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 text-primary">
            Chatiwy
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with people from around the world in private, one-on-one conversations.
          </p>
          {!currentUser ? (
            <Button
              size="lg"
              onClick={handleLogin}
              className="rounded-xl px-8 text-base h-12 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              Start Chatting
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate('/chat')}
              className="rounded-xl px-8 text-base h-12 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              Continue to Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
