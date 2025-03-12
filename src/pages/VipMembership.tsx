import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Check, LogIn, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const VipMembership = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const features = [
    'Send unlimited photos',
    'Send voice messages',
    'Longer chat history',
    'Customer Support',
    'Unique avatar options',
    'Appear at the top of the list',
    'Ad free',
    'React, reply, edit, unsend messages',
    'View message status',
    'Special Badges',
    'Control your online status'
  ];
  
  const plans = [
    {
      id: 'monthly',
      price: '$4.99',
      period: 'Billed every month.',
      popular: false
    },
    {
      id: 'biannual',
      price: '$22.99',
      period: 'Billed every 6 month.',
      popular: true
    },
    {
      id: 'annual',
      price: '$39.99',
      period: 'Billed annually.',
      popular: false
    }
  ];
  
  const handleGetStarted = () => {
    setShowAuthDialog(true);
  };
  
  const handleLogin = () => {
    setShowAuthDialog(false);
    navigate('/login');
  };
  
  const handleRegister = () => {
    setShowAuthDialog(false);
    navigate('/register');
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold mb-4">VIP Membership Pricing</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-card rounded-xl p-6 shadow-md border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                  Most popular!
                </div>
              )}
              
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold">{plan.price}</h2>
                <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
              </div>
              
              <div className="flex-1 space-y-3 mb-6">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
                onClick={handleGetStarted}
              >
                Get started
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center space-x-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Terms & Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact us</a>
          <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
      </main>
      
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Choose an option</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col h-auto py-4"
              onClick={handleLogin}
            >
              <LogIn className="h-10 w-10 mb-2" />
              <span>Login</span>
              <span className="text-xs text-muted-foreground mt-1">Already a VIP member</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto py-4"
              onClick={handleRegister}
            >
              <UserPlus className="h-10 w-10 mb-2" />
              <span>Register</span>
              <span className="text-xs text-muted-foreground mt-1">New to VIP</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VipMembership;
