
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Mail, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn } = useUser();
  
  const [step, setStep] = useState<'confirmation' | 'verification' | 'email-sent'>('confirmation');
  const [credentials, setCredentials] = useState<{ identifier: string; password: string }>({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  const handleConfirmation = () => {
    setStep('verification');
  };
  
  const handleCancel = () => {
    // Reset state and close dialog
    setStep('confirmation');
    setCredentials({ identifier: '', password: '' });
    setError(null);
    onOpenChange(false);
  };
  
  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear error when user is typing
    if (error) setError(null);
  };
  
  const validateCredentials = () => {
    // In a real app, you would validate against a database
    // For this example, we'll check against the currentUser
    const isEmailValid = credentials.identifier === currentUser?.email;
    const isUsernameValid = credentials.identifier === currentUser?.username;
    
    // Simulating password check (in a real app, you'd check hashed passwords)
    const isPasswordValid = credentials.password === 'password123';
    
    return (isEmailValid || isUsernameValid) && isPasswordValid;
  };
  
  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateCredentials()) {
      // Proceed to email confirmation step
      setStep('email-sent');
      
      // Simulate sending email
      console.log('Sending account deletion confirmation email to:', currentUser?.email);
    } else {
      setError('Incorrect nickname/email or password');
    }
  };
  
  const handleFinalConfirmation = () => {
    // Log out the user
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    // Close dialog
    onOpenChange(false);
    
    // Show toast notification
    toast({
      title: "Account deletion initiated",
      description: "Your account will be deleted once you confirm via email."
    });
    
    // Redirect to feedback page
    navigate('/feedback', { replace: true });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'confirmation' && (
          <>
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-center text-xl">Delete Account</DialogTitle>
              <DialogDescription className="text-center">
                <p className="text-red-500 font-medium">Are you sure you want to delete your account?</p>
                <p className="text-red-500 font-medium">Once you do, this action is irreversible.</p>
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="sm:justify-center gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                No, Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmation}
              >
                Yes, Delete
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === 'verification' && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Your Identity</DialogTitle>
              <DialogDescription>
                Please enter your credentials to confirm account deletion.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleVerificationSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Nickname or Email</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  value={credentials.identifier}
                  onChange={handleCredentialChange}
                  placeholder="Enter your nickname or email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleCredentialChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
              
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setStep('confirmation')}>
                  Back
                </Button>
                <Button type="submit" variant="destructive">
                  Verify
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
        
        {step === 'email-sent' && (
          <>
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <DialogTitle className="text-center">Confirmation Email Sent</DialogTitle>
              <DialogDescription className="text-center">
                We've sent a deletion confirmation link to your email address. Please check your inbox and follow the link to complete the account deletion process.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                onClick={handleFinalConfirmation}
              >
                OK
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
