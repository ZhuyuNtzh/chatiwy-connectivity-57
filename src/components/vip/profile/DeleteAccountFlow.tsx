
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

interface DeleteAccountFlowProps {
  onDeleteComplete: () => void;
}

export const DeleteAccountFlow = ({ onDeleteComplete }: DeleteAccountFlowProps) => {
  const { currentUser } = useUser();
  const [showInitialConfirm, setShowInitialConfirm] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [credentials, setCredentials] = useState({
    identifier: '', // This can be either email or username
    password: ''
  });

  const handleDelete = () => {
    setShowInitialConfirm(true);
  };

  const handleInitialConfirm = () => {
    setShowInitialConfirm(false);
    setShowCredentialsDialog(true);
  };

  const handleCredentialSubmit = () => {
    const isValid = 
      (credentials.identifier === currentUser?.email || 
       credentials.identifier === currentUser?.username) &&
      credentials.password.length > 0;

    if (isValid) {
      setShowCredentialsDialog(false);
      setShowFinalConfirm(true);
      // Here you would typically trigger the email sending process
    } else {
      toast({
        variant: "destructive",
        title: "Invalid credentials",
        description: "Please check your email/username and password",
      });
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={handleDelete}
        className="mb-4 sm:mb-0 bg-red-500 hover:bg-red-600"
      >
        Delete Account
      </Button>

      {/* Initial Confirmation Dialog */}
      <Dialog open={showInitialConfirm} onOpenChange={setShowInitialConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-red-600">
              Are you sure you want to delete your account? Once you do, this action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowInitialConfirm(false)}>
              No, Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleInitialConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
            <DialogDescription>
              Please enter your credentials to confirm the account deletion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email or Username</Label>
              <Input
                value={credentials.identifier}
                onChange={(e) => setCredentials(prev => ({ ...prev, identifier: e.target.value }))}
                placeholder="Enter your email or username"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCredentialsDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCredentialSubmit}
              className="bg-red-500 hover:bg-red-600"
              disabled={!credentials.identifier || !credentials.password}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check Your Email</DialogTitle>
            <DialogDescription>
              We've sent a deletion confirmation link to your email address. Please check your inbox and follow the link to complete the account deletion process.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowFinalConfirm(false);
              onDeleteComplete();
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
