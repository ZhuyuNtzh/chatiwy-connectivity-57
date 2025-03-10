
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RulesModal = ({ open, onOpenChange }: RulesModalProps) => {
  const { setRulesAccepted } = useUser();
  const navigate = useNavigate();
  const [declining, setDeclining] = useState(false);

  const handleAccept = () => {
    setRulesAccepted(true);
    onOpenChange(false);
  };

  const handleDecline = () => {
    if (declining) {
      // User confirmed they want to exit (clicked "OK")
      navigate('/');
      onOpenChange(false);
    } else {
      // First click on Decline button - show warning
      setDeclining(true);
    }
  };

  const handleBackToRules = () => {
    setDeclining(false);
  };

  const rules = [
    'Be respectful and kind to other users',
    'No harassment, bullying, or hate speech',
    'No sharing of personal contact information',
    'No spamming or flooding the chat',
    'No explicit or adult content',
    'No impersonation of other users or staff',
    'Respect the privacy of other users',
    'Follow character and message limits'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md animate-scale-in p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-primary/10 to-accent/10">
          <DialogTitle className="text-2xl font-semibold">Site Rules</DialogTitle>
          <DialogDescription>
            Please read and accept our site rules before continuing
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {declining ? (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm">You'll be kicked out for declining to follow the rules.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {rules.map((rule, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{rule}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 border-t border-border/50 flex flex-col sm:flex-row gap-2">
          <div className="flex w-full gap-3">
            {declining ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDecline} 
                  className="flex-1 border-destructive text-destructive"
                >
                  OK
                  <X className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleBackToRules} 
                  className="flex-1"
                >
                  Back
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDecline} 
                  className="flex-1"
                >
                  Decline
                </Button>
                <Button 
                  onClick={handleAccept} 
                  className="flex-1"
                >
                  Accept
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;
