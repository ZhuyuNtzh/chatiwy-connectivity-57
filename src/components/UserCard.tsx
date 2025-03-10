
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../contexts/UserContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, Shield, Award } from 'lucide-react';

interface UserCardProps {
  user: UserProfile;
  animationDelay?: number;
}

const UserCard = ({ user, animationDelay = 0 }: UserCardProps) => {
  const navigate = useNavigate();
  
  const roleIcon = () => {
    if (user.role === 'admin') return <Shield className="h-4 w-4 text-destructive" />;
    if (user.role === 'vip') return <Award className="h-4 w-4 text-accent" />;
    return null;
  };

  const roleClass = () => {
    if (user.role === 'admin') return 'border-destructive/30 hover:border-destructive/50';
    if (user.role === 'vip') return 'border-accent/30 hover:border-accent/50';
    return 'border-muted/60 hover:border-muted';
  };

  const handleStartChat = () => {
    navigate(`/chat/${user.username}`);
  };

  return (
    <div 
      className={`glass-card p-4 transition-all duration-300 border ${roleClass()}`}
      style={{ 
        animationDelay: `${animationDelay}s`,
        animation: 'fade-in-up 0.5s ease-out forwards',
        opacity: 0 
      }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-semibold bg-primary/10 text-primary`}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-medium truncate">{user.username}</h3>
            {roleIcon()}
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            <div className="flex flex-wrap gap-2">
              {user.age && <span>{user.age}</span>}
              {user.gender && <span>• {user.gender}</span>}
              {user.location && <span>• {user.location}</span>}
            </div>
            
            {user.interests && user.interests.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {user.interests.slice(0, 3).map((interest, index) => (
                  <span 
                    key={index}
                    className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleStartChat}
          className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-primary/10"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
