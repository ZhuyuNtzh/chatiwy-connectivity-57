
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvatarSelectPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar: string;
  onAvatarSelect: (avatarSrc: string) => void;
}

// Mock avatar options
const avatarOptions = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1502378735452-bc7d86632805?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1627161683077-e34782c24d81?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1632922267756-9b71242b1592?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=128&h=128&fit=crop',
];

const AvatarSelectPopup = ({
  open,
  onOpenChange,
  currentAvatar,
  onAvatarSelect
}: AvatarSelectPopupProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  
  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
  };
  
  const handleSave = () => {
    onAvatarSelect(selectedAvatar);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Avatar</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-80 pr-4 -mr-4">
          <div className="grid grid-cols-3 gap-4 py-4">
            {avatarOptions.map((avatar, index) => (
              <button
                key={index}
                className={`relative w-full aspect-square rounded-md overflow-hidden border-2 ${
                  selectedAvatar === avatar ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => handleAvatarClick(avatar)}
              >
                <img
                  src={avatar}
                  alt={`Avatar option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarSelectPopup;
