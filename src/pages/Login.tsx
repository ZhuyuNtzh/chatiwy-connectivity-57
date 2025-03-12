
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import ForgotPasswordDialog from '@/components/auth/ForgotPasswordDialog';

const Login = () => {
  const { isDarkMode } = useTheme();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-lg mx-auto px-4 pt-24 pb-12">
        <Card>
          <LoginForm 
            handleOpenForgotPassword={() => setShowForgotPassword(true)} 
          />
        </Card>
      </main>
      
      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
};

export default Login;
