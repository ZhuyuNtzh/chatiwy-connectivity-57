
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface AvatarSelectPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string;
  onAvatarSelect: (avatarSrc: string) => void;
}

const AvatarSelectPopup = ({ open, onOpenChange, currentAvatar, onAvatarSelect }: AvatarSelectPopupProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [avatarOptions, setAvatarOptions] = useState<Array<{ id: string; src: string; alt: string }>>([]);
  
  useEffect(() => {
    // Standard avatars
    const standardAvatars = [
      { id: 'avatar1', src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 1' },
      { id: 'avatar2', src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 2' },
      { id: 'avatar3', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 3' },
      { id: 'avatar4', src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 4' },
      { id: 'avatar5', src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 5' },
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
    ];
    
    // Custom avatars from the uploads folder
    const customAvatars = [
      { id: 'custom1', src: '/lovable-uploads/a1551f2b-73e8-42c5-b33d-842ef4dd9fd8.png', alt: 'Custom Avatar 1' },
      { id: 'custom2', src: '/lovable-uploads/a427c90b-f62b-48e5-b2f6-e705879e6bba.png', alt: 'Custom Avatar 2' },
      { id: 'custom3', src: '/lovable-uploads/c80784b4-1560-465c-ac27-ce7bab7aa1d5.png', alt: 'Custom Avatar 3' },
      { id: 'custom4', src: '/lovable-uploads/e3b5491b-50db-4077-a99f-3de3837ccad6.png', alt: 'Custom Avatar 4' },
    ];
    
    // Combine both sets of avatars
    setAvatarOptions([...customAvatars, ...standardAvatars]);
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedAvatar(currentAvatar);
    }
  }, [open, currentAvatar]);

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
          <DialogTitle>Choose Avatar</DialogTitle>
          <DialogDescription>
            Select from our collection of avatars
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] px-1">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-4">
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
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        
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
