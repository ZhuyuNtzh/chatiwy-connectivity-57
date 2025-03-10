
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface LogoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Logout Confirmation</DialogTitle>
          <DialogDescription>
            Do you want to leave the chat? We will miss you
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            No
          </Button>
          <Button
            variant="destructive"
            className="hover:bg-red-600"
            onClick={onConfirm}
          >
            Yes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
