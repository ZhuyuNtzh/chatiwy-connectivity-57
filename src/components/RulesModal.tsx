
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { setRulesAccepted, setIsLoggedIn, setCurrentUser } = useUser();
  const [showWarning, setShowWarning] = React.useState(false);
  
  const handleAccept = () => {
    setRulesAccepted(true);
    onOpenChange(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    setShowWarning(true);
  };

  const handleWarningOk = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setRulesAccepted(false);
    navigate('/');
  };

  const handleWarningBack = () => {
    setShowWarning(false);
  };

  if (showWarning) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-w-[95%] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              If you decline the rules you will be disconnected from the site
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleWarningBack}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleWarningOk}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95%] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-2">
          <DialogTitle>Chat Rules</DialogTitle>
          <DialogDescription>
            Please read and accept our community rules before continuing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-2 py-2">
          <div className="space-y-3">
            <h3 className="font-bold text-red-600">Age Restriction (18+)</h3>
            <p className="text-sm text-muted-foreground">
              Users must be 18 years of age or older to participate.
            </p>
            
            <h3 className="font-medium">Respectful Communication</h3>
            <p className="text-sm text-muted-foreground">
              No harassment, hate speech, or personal attacks.
            </p>
            
            <h3 className="font-medium">No Illegal Activity</h3>
            <p className="text-sm text-muted-foreground">
              Discussions or promotion of illegal activities are strictly prohibited.
            </p>
            
            <h3 className="font-medium">Privacy Protection</h3>
            <p className="text-sm text-muted-foreground">
              Do not share personal information or solicit others' private details.
            </p>
            
            <h3 className="font-medium">No Spam or Solicitation</h3>
            <p className="text-sm text-muted-foreground">
              Avoid spamming, advertising, or unsolicited promotion.
            </p>

            <p className="text-sm font-bold text-red-600 mt-3 border-t pt-3">
              Note: In case of violating the rules mentioned above the user will be permanently banned from the site.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between mt-3">
          <Button
            variant="outline"
            className="hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleDecline}
            size="sm"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            size="sm"
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;
