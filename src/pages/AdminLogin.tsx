
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn, setUserRole } = useUser();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Admin credentials check
    if (
      (identifier === 'admin@chatwii.com' || identifier === 'admin') && 
      password === 'admin123!'
    ) {
      setCurrentUser({
        username: 'Admin',
        role: 'admin',
        isAdmin: true,
        email: 'admin@chatwii.com',
      });
      setUserRole('admin');
      setIsLoggedIn(true);
      
      toast.success("Admin login successful");
      
      // Navigate to the admin dashboard
      navigate('/admin-dashboard');
      return;
    }
    
    setTimeout(() => {
      setIsLoading(false);
      toast.error("Invalid admin credentials");
    }, 1000);
  };
  
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate both email and phone are provided
    if (!forgotEmail || !forgotPhone) {
      toast.error("Both email and phone number are required for admin password reset");
      setIsLoading(false);
      return;
    }
    
    // Simulate password reset - in a real app, you'd call an API
    setTimeout(() => {
      setIsLoading(false);
      setShowForgotPassword(false);
      setShowResetSuccess(true);
      
      // Reset the form
      setForgotEmail('');
      setForgotPhone('');
    }, 1500);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-lg mx-auto px-4 pt-24 pb-12">
        <Card className="border-2 border-amber-500/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <ShieldAlert className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Restricted area. Authorized personnel only.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Admin ID</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Admin username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="border-amber-500/20"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 text-sm font-medium h-auto text-amber-500"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Reset password
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-amber-500/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access System"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      
      {/* Password Reset Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Password Reset</DialogTitle>
            <DialogDescription>
              Please enter both your admin email and phone number for verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Admin Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@chatwii.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgotPhone">Admin Phone</Label>
              <Input
                id="forgotPhone"
                type="tel"
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isLoading ? "Processing..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Reset Success Dialog */}
      <AlertDialog open={showResetSuccess} onOpenChange={setShowResetSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Reset Initiated</AlertDialogTitle>
            <AlertDialogDescription>
              A password reset link has been sent to the provided email address. Additionally, a verification code has been sent to your phone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowResetSuccess(false)}>
              Acknowledge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLogin;
