import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Google } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { setUserRole, setIsLoggedIn } = useUser();
  const { isDarkMode } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      const userRole = email.includes('vip') ? 'vip' : 'standard';
      
      setUserRole(userRole);
      setIsLoggedIn(true);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${email}!`,
      });
      
      // Redirect VIP users to their profile page, others to profile setup
      if (userRole === 'vip') {
        navigate('/vip-profile');
      } else {
        navigate('/profile-setup');
      }
    } else {
      toast({
        title: "Login failed",
        description: "Please enter both email and password",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h2 className="text-2xl mb-6 text-center">Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Log In
            </Button>
            <Link
              to="/register"
              className="inline-block align-baseline font-bold text-sm text-primary hover:text-primary-darker"
            >
              Register
            </Link>
          </div>
        </form>
        
        <div className="mt-6 flex flex-col items-center">
          <span className="text-gray-600 text-sm mb-3">Or login with</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              Github
            </Button>
            <Button variant="outline" size="sm">
              <Google className="w-4 h-4 mr-2" />
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
