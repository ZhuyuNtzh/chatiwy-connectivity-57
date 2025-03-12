
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User2 } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarSrc: string) => void;
}

const avatarOptions = [
  { id: 'avatar1', src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 1' },
  { id: 'avatar2', src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 2' },
  { id: 'avatar3', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 3' },
  { id: 'avatar4', src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 4' },
  { id: 'avatar5', src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 5' },
];

const AvatarSelector = ({ selectedAvatar, onSelect }: AvatarSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Select Avatar</Label>
      <div className="flex flex-wrap gap-4 justify-center">
        {avatarOptions.map((avatar) => (
          <div 
            key={avatar.id}
            onClick={() => onSelect(avatar.src)}
            className={`cursor-pointer transition-all ${
              selectedAvatar === avatar.src 
                ? 'ring-2 ring-primary ring-offset-2' 
                : 'hover:opacity-80'
            }`}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar.src} alt={avatar.alt} />
              <AvatarFallback>
                <User2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
