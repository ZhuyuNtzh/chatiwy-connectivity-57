
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';
import { useUser, UserRole } from '../contexts/UserContext';
import { UserCircle, CreditCard, ShieldCheck } from 'lucide-react';

const UserSelection = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUser();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    
    if (role === 'admin') {
      navigate('/admin-login');
    } else {
      navigate('/profile-setup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-down">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your User Type</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select the user type that best fits your needs. Each type offers different features and capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 staggered-fade-in">
            <Card className="glass-card transition-all duration-300 hover:shadow-lg border-secondary/50 hover:border-primary/50">
              <CardHeader>
                <div className="mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center">Standard User</CardTitle>
                <CardDescription className="text-center">Quick access, no registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Feature>No registration required</Feature>
                <Feature>Text chat with 140 character limit</Feature>
                <Feature>Image sharing (10/day)</Feature>
                <Feature>1 hour chat history</Feature>
                <Feature>Basic profile options</Feature>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleRoleSelect('standard')}
                >
                  Continue as Standard
                </Button>
              </CardFooter>
            </Card>

            <Card className="glass-card transition-all duration-300 hover:shadow-lg border-secondary/50 hover:border-accent/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent/20 px-3 py-1 text-xs font-medium text-accent rounded-bl-lg">
                Popular
              </div>
              <CardHeader>
                <div className="mb-4 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CreditCard className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-center">VIP User</CardTitle>
                <CardDescription className="text-center">Enhanced features, priority access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Feature>Extended chat history (10 hours)</Feature>
                <Feature>Text chat with 200 character limit</Feature>
                <Feature>Unlimited image sharing</Feature>
                <Feature>Voice messages</Feature>
                <Feature>Message status indicators</Feature>
                <Feature>Customizable profile with badges</Feature>
                <Feature>Priority in user list</Feature>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90" 
                  onClick={() => handleRoleSelect('vip')}
                >
                  Join as VIP
                </Button>
              </CardFooter>
            </Card>

            <Card className="glass-card transition-all duration-300 hover:shadow-lg border-secondary/50 hover:border-destructive/50">
              <CardHeader>
                <div className="mb-4 h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-center">Admin</CardTitle>
                <CardDescription className="text-center">Moderation access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Feature>Full site control and monitoring</Feature>
                <Feature>User management capabilities</Feature>
                <Feature>Extended chat history (24 hours)</Feature>
                <Feature>Special profile with distinctive badge</Feature>
                <Feature>Access to reports and moderation tools</Feature>
                <Feature>Real-time profile changes</Feature>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-destructive hover:bg-destructive/90" 
                  onClick={() => handleRoleSelect('admin')}
                >
                  Admin Login
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const Feature = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 h-5 w-5">
      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <p className="ml-2">{children}</p>
  </div>
);

export default UserSelection;
