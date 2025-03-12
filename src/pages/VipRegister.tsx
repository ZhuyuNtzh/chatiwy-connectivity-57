
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { useUser } from '@/contexts/UserContext';
import VipSignupStep from '@/components/vip/VipSignupStep';
import VipProfileStep from '@/components/vip/VipProfileStep';
import VipPaymentStep from '@/components/vip/VipPaymentStep';
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
    avatar: ''
  });
  
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };
  
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };
  
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleComplete = () => {
    toast({
      title: "Registration successful!",
      description: "Welcome to VIP membership"
    });
    
    // Update user context
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
    
    // Navigate to main app
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
  
  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Join VIP Membership</h1>
          <div className="flex justify-center items-center space-x-2 md:space-x-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${currentStep >= index 
                      ? 'bg-secondary text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`hidden md:block h-1 w-16 mx-2
                      ${currentStep > index 
                        ? 'bg-secondary' 
                        : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <h2 className="mt-4 text-xl font-medium">{steps[currentStep].title}</h2>
        </div>
        
        <div className="w-full max-w-md mx-auto relative overflow-hidden">
          <AnimatePresence custom={currentStep} initial={false}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
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
