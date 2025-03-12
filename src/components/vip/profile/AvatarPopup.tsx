
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvatarPopupProps {
  selectedAvatar: string;
  onSelect: (avatarSrc: string) => void;
}

const avatarOptions = [
  '/lovable-uploads/4845de90-3785-43c0-ad49-9bd7bfc5460b.png',
  '/lovable-uploads/f017b15a-42fd-4c65-a699-e2acdd6d3114.png',
  '/lovable-uploads/478ecc2a-5615-483d-a0a3-85588c1e4ef0.png',
  '/lovable-uploads/56d990de-ea0d-46ea-8c0b-70daaaf5229f.png',
  '/lovable-uploads/05772536-8f6d-4665-8498-a99d05858b5b.png',
  '/lovable-uploads/163c1fd4-77ea-4b97-abad-0dbf500c23ba.png',
  '/lovable-uploads/ad793e65-aea6-41c6-8254-cbc05feb3e91.png',
  '/lovable-uploads/4e33e9b9-8e0e-413f-906b-890b7ff4b5d1.png',
  '/lovable-uploads/178a0355-721a-45f1-90cc-832950101724.png',
  '/lovable-uploads/772522f9-93a5-4bb9-87eb-12f150810678.png',
  '/lovable-uploads/68ed686d-c5da-4c4f-9514-08727ea05561.png'
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
