
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn, setUserRole } = useUser();
  
  const [identifier, setIdentifier] = useState(''); // Can be email or nickname
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // VIP test accounts
    const vipAccounts = [
      { identifier: 'vip@chatwii.com', password: 'viptest123', username: 'VIPTester' },
      { identifier: 'VIPTester', password: 'viptest123', email: 'vip@chatwii.com' }
    ];
    
    // Check if this is a VIP account
    const isVipAccount = vipAccounts.some(
      account => (account.identifier === identifier || account.email === identifier) && account.password === password
    );
    
    if (isVipAccount) {
      // First set up user data in context before navigation
      const vipUser = {
        username: 'VIPTester',
        role: 'vip' as const,
        isVip: true,
        gender: 'Female',
        age: 27,
        location: 'United States',
        interests: ['Music', 'Travel', 'Technology', 'Photography'],
        avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&h=100',
        email: 'vip@chatwii.com',
      };
      
      // Set session storage first to avoid race conditions
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', 'vip');
      
      // Now update context
      setCurrentUser(vipUser);
      setUserRole('vip');
      setIsLoggedIn(true);
      
      console.log("VIP login successful - redirecting to settings page");
      
      toast({
        title: "VIP Login successful",
        description: "Welcome to Chatwii VIP!",
      });
      
      // Complete the login process and navigate
      setTimeout(() => {
        setIsLoading(false);
        navigate('/settings', { replace: true }); // Using replace to clear history
      }, 100);
      
      return;
    }
    
    // Mock authentication - for standard users
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, regular users get standard accounts
      setCurrentUser({
        username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        role: 'standard',
        isVip: false,
        gender: 'Male',
        age: 25,
        location: 'United States',
        interests: ['Gaming', 'Music', 'Technology'],
        email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
      });
      setUserRole('standard');
      setIsLoggedIn(true);
      
      toast({
        title: "Login successful",
        description: "Welcome back to Chatwii",
      });
      
      console.log("Standard user detected, redirecting to chat interface");
      navigate('/chat-interface');
    }, 1000);
  };
  
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock password reset - in a real app, you'd call an API
    setTimeout(() => {
      setIsLoading(false);
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
      
      toast({
        title: "Password reset link sent",
        description: "Please check your email for instructions",
      });
    }, 1000);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-lg mx-auto px-4 pt-24 pb-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Nickname</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="yourname@example.com or nickname"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 text-sm font-medium h-auto"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
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
            <CardFooter className="flex flex-col">
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 mb-2"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-center text-sm mt-2">
                Don't have an account?{" "}
                <Link to="/vip-membership" className="text-accent font-medium hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
      
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot your password?</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email address</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="yourname@example.com"
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
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
