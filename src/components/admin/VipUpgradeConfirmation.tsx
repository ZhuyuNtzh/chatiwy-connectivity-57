
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Crown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface VipUpgradeConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
  };
  onConfirm: (userId: number, username: string, expiryDate: Date) => void;
}

const VipUpgradeConfirmation: React.FC<VipUpgradeConfirmationProps> = ({
  isOpen,
  onOpenChange,
  user,
  onConfirm,
}) => {
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
  );
  
  const handleConfirm = () => {
    if (expiryDate && user) {
      onConfirm(user.id, user.username, expiryDate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Temporary VIP Upgrade
          </DialogTitle>
          <DialogDescription>
            Grant temporary VIP status to {user?.username}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label>VIP Status Expiry Date</Label>
            <div className="border rounded-md p-4">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={setExpiryDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {expiryDate ? (
                <>Selected expiry date: <span className="font-medium">{format(expiryDate, "PPP")}</span></>
              ) : (
                "Please select an expiry date"
              )}
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-white"
            disabled={!expiryDate}
          >
            Confirm Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipUpgradeConfirmation;
