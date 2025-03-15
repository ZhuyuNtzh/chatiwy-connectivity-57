
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User2, ChevronRight } from 'lucide-react';
import AvatarSelectPopup from './AvatarSelectPopup';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarSrc: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onSelect }: AvatarSelectorProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [previewAvatars, setPreviewAvatars] = useState<{ id: string; src: string; alt: string }[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch the full list of avatars from the backend
    // For now, we'll use a subset for the preview
    const sampleAvatars = [
      { id: 'avatar1', src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 1' },
      { id: 'avatar2', src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 2' },
      { id: 'avatar3', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 3' },
      { id: 'avatar4', src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 4' },
      { id: 'avatar5', src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 5' },
    ];
    
    // Add custom avatars from the uploads folder
    const customAvatars = [
      { id: 'custom1', src: '/lovable-uploads/a1551f2b-73e8-42c5-b33d-842ef4dd9fd8.png', alt: 'Custom Avatar 1' },
      { id: 'custom2', src: '/lovable-uploads/a427c90b-f62b-48e5-b2f6-e705879e6bba.png', alt: 'Custom Avatar 2' },
      { id: 'custom3', src: '/lovable-uploads/c80784b4-1560-465c-ac27-ce7bab7aa1d5.png', alt: 'Custom Avatar 3' },
      { id: 'custom4', src: '/lovable-uploads/e3b5491b-50db-4077-a99f-3de3837ccad6.png', alt: 'Custom Avatar 4' },
    ];
    
    setPreviewAvatars([...sampleAvatars, ...customAvatars]);
  }, []);

  return (
    <div className="space-y-3">
      <Label>Select Avatar</Label>
      
      <div className="flex flex-col items-center space-y-4">
        {selectedAvatar ? (
          <Avatar className="h-24 w-24">
            <AvatarImage src={selectedAvatar} alt="Selected avatar" />
            <AvatarFallback>
              <User2 className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-24 w-24 bg-gray-200">
            <AvatarFallback>
              <User2 className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => setIsPopupOpen(true)}
          className="flex items-center"
        >
          Choose Avatar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {previewAvatars.slice(0, 5).map((avatar) => (
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
      
      <AvatarSelectPopup
        open={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        currentAvatar={selectedAvatar}
        onAvatarSelect={onSelect}
      />
    </div>
  );
};

export default AvatarSelector;
