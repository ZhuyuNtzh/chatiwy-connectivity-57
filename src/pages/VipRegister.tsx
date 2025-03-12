
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import VipSignupStep from '@/components/vip/VipSignupStep';
import VipProfileStep from '@/components/vip/VipProfileStep';
import VipPaymentStep from '@/components/vip/VipPaymentStep';
import VipProgressSteps from '@/components/vip/VipProgressSteps';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const VipRegister = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn, setUserRole } = useUser();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    gender: '',
    interests: [] as string[],
    country: '',
    age: '25',
    acceptTerms: false,
    avatar: '',
    plan: 'monthly' as 'monthly' | '6months' | 'yearly'
  });
  
  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => Math.max(0, prev - 1));
  const updateFormData = (data: Partial<typeof formData>) => setFormData(prev => ({ ...prev, ...data }));
  
  const handleComplete = () => {
    toast({
      title: "Registration successful!",
      description: "Welcome to VIP membership"
    });
    
    setCurrentUser({
      username: formData.nickname,
      role: 'vip',
      isVip: true,
      gender: formData.gender,
      interests: formData.interests,
      location: formData.country,
      age: parseInt(formData.age),
      avatar: formData.avatar
    });
    setUserRole('vip');
    setIsLoggedIn(true);
    
    navigate('/chat-interface');
  };

  const steps = [
    {
      title: "Create Account",
      component: (
        <VipSignupStep 
          formData={formData} 
          updateFormData={updateFormData}
          onNext={handleNext}
        />
      )
    },
    {
      title: "Profile Setup",
      component: (
        <VipProfileStep
          formData={formData}
          updateFormData={updateFormData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )
    },
    {
      title: "Payment",
      component: (
        <VipPaymentStep
          formData={formData}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-24 pb-12">
        <VipProgressSteps steps={steps} currentStep={currentStep} />
        
        <div className="w-full max-w-md mx-auto relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[currentStep].component}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VipRegister;
