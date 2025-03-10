
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RulesModal from './RulesModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RulesModalWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

const RulesModalWrapper = ({ open, onOpenChange, onAccept }: RulesModalWrapperProps) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  
  const handleAccept = () => {
    onOpenChange(false);
    if (onAccept) onAccept();
  };
  
  const handleDecline = () => {
    setShowWarning(true);
  };
  
  const handleKickOut = () => {
    setShowWarning(false);
    onOpenChange(false);
    navigate('/');
  };
  
  const handleBack = () => {
    setShowWarning(false);
  };
  
  if (showWarning) {
    return (
      <Dialog open={true} onOpenChange={() => setShowWarning(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              You'll be kicked out for declining to follow the rules.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack}
            >
              Back
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleKickOut}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <RulesModal 
      open={open} 
      onOpenChange={onOpenChange}
      footerContent={
        <div className="flex justify-between mt-4">
          <Button onClick={handleDecline} variant="outline">
            Decline
          </Button>
          <Button onClick={handleAccept} className="bg-[#FB9E41] hover:bg-[#FB9E41]/90 text-white">
            Accept
          </Button>
        </div>
      }
    />
  );
};

export default RulesModalWrapper;
