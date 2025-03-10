
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from '@/contexts/UserContext';

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  footerContent?: React.ReactNode;
}

const RulesModal: React.FC<RulesModalProps> = ({ 
  open, 
  onOpenChange,
  onAccept,
  footerContent 
}) => {
  const { setRulesAccepted } = useUser();
  
  const handleAccept = () => {
    setRulesAccepted(true);
    onOpenChange(false);
    if (onAccept) onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Rules</DialogTitle>
          <DialogDescription>
            Please read and accept our community rules before continuing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h3 className="font-medium">1. Respect Other Users</h3>
            <p className="text-sm text-muted-foreground">
              Treat everyone with respect. Harassment, hate speech, or discrimination of any kind is not allowed.
            </p>
            
            <h3 className="font-medium">2. No Inappropriate Content</h3>
            <p className="text-sm text-muted-foreground">
              Do not share explicit, violent, or otherwise inappropriate content. This includes text, images, and links.
            </p>
            
            <h3 className="font-medium">3. Protect Your Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Do not share personal information like phone numbers, addresses, or financial details with other users.
            </p>
            
            <h3 className="font-medium">4. No Spamming</h3>
            <p className="text-sm text-muted-foreground">
              Do not spam messages, advertisements, or promotional content.
            </p>
            
            <h3 className="font-medium">5. Report Problems</h3>
            <p className="text-sm text-muted-foreground">
              If you encounter inappropriate behavior or content, please report it to our moderation team.
            </p>
          </div>
        </div>
        
        {footerContent ? (
          footerContent
        ) : (
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={handleAccept}
            >
              I Accept
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;
