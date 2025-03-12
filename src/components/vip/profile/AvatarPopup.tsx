
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarPopupProps {
  selectedAvatar: string;
  onSelect: (avatarSrc: string) => void;
}

const avatarOptions = [
  '/path-to-your-first-avatar.png',  // We'll update these paths once you provide the images
  '/path-to-your-second-avatar.png',
  '/path-to-your-third-avatar.png',
  '/path-to-your-fourth-avatar.png',
  '/path-to-your-fifth-avatar.png',
  '/path-to-your-sixth-avatar.png',
];

const AvatarPopup = ({ selectedAvatar, onSelect }: AvatarPopupProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {selectedAvatar ? (
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedAvatar} alt="Selected avatar" />
              <AvatarFallback><User2 className="h-8 w-8" /></AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              <span>Choose Avatar</span>
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="grid grid-cols-3 gap-4 py-4">
          {avatarOptions.map((avatar, index) => (
            <button
              key={index}
              onClick={() => onSelect(avatar)}
              className={`relative rounded-lg overflow-hidden transition-all ${
                selectedAvatar === avatar 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'hover:opacity-80'
              }`}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
                <AvatarFallback><User2 className="h-10 w-10" /></AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPopup;
