
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvatarSelectPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string;
  onAvatarSelect: (avatarSrc: string) => void;
}

const avatarOptions = [
  { id: 'avatar1', src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 1' },
  { id: 'avatar2', src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 2' },
  { id: 'avatar3', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 3' },
  { id: 'avatar4', src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 4' },
  { id: 'avatar5', src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 5' },
  // Add 15 more avatar options for a 4x5 grid
  { id: 'avatar6', src: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 6' },
  { id: 'avatar7', src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 7' },
  { id: 'avatar8', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 8' },
  { id: 'avatar9', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 9' },
  { id: 'avatar10', src: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 10' },
  { id: 'avatar11', src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 11' },
  { id: 'avatar12', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 12' },
  { id: 'avatar13', src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 13' },
  { id: 'avatar14', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 14' },
  { id: 'avatar15', src: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 15' },
  { id: 'avatar16', src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 16' },
  { id: 'avatar17', src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 17' },
  { id: 'avatar18', src: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 18' },
  { id: 'avatar19', src: 'https://images.unsplash.com/photo-1563237023-b1e970526dcb?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 19' },
  { id: 'avatar20', src: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 20' },
];

const AvatarSelectPopup = ({ open, onOpenChange, currentAvatar, onAvatarSelect }: AvatarSelectPopupProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);

  const handleSave = () => {
    onAvatarSelect(selectedAvatar);
    toast({
      title: "Avatar updated",
      description: "Your avatar has been changed successfully",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Choose Avatar</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-5 gap-2 p-4">
          {avatarOptions.map((avatar) => (
            <div 
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.src)}
              className={`cursor-pointer transition-all rounded-full bg-gray-100 p-2 flex items-center justify-center ${
                selectedAvatar === avatar.src ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
              }`}
            >
              <img 
                src={avatar.src} 
                alt={avatar.alt} 
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          ))}
        </div>
        
        <div className="px-4 py-2">
          <Button 
            className="w-full bg-orange-400 hover:bg-orange-500 text-white"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarSelectPopup;
