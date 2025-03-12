
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import NicknameInput from '@/components/profile/NicknameInput';

interface VipSignupFormData {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface VipSignupStepProps {
  formData: VipSignupFormData;
  updateFormData: (data: Partial<VipSignupFormData>) => void;
  onNext: () => void;
}

const VipSignupStep = ({
  formData,
  updateFormData,
  onNext
}: VipSignupStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTestAccount, setShowTestAccount] = useState(false);
  
  const fillTestCredentials = () => {
    updateFormData({
      email: 'vip@chatwii.com',
      nickname: 'VIPTester',
      password: 'viptest123',
      confirmPassword: 'viptest123',
      acceptTerms: true
    });
    toast({
      title: "Test Account Filled",
      description: "You can use these credentials to test the VIP features"
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.nickname || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.acceptTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please accept the terms and conditions to proceed",
        variant: "destructive"
      });
      return;
    }
    
    onNext();
  };
  
  return (
    <Card className="w-full shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="yourname@example.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className="pl-9"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <NicknameInput
            nickname={formData.nickname}
            onChange={(value) => updateFormData({ nickname: value })}
            isVip={true}
          />
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className="pl-9"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                className="pl-9"
                required
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => updateFormData({ acceptTerms: !!checked })}
            />
            <Label 
              htmlFor="terms" 
              className="text-sm font-normal"
            >
              I accept the <a href="#" className="text-accent hover:underline">terms and conditions</a>
            </Label>
          </div>
          
          {/* Test Account Information */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-muted-foreground"
              onClick={fillTestCredentials}
            >
              <Info className="h-4 w-4" />
              Use Test VIP Account
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Email: vip@chatwii.com | Password: viptest123
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            Next
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default VipSignupStep;
