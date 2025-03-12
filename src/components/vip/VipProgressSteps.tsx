
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface VipProgressStepsProps {
  steps: Array<{ title: string }>;
  currentStep: number;
}

const VipProgressSteps = ({ steps, currentStep }: VipProgressStepsProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold">Join VIP Membership</h1>
      </div>
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
      <h2 className="mt-4 text-xl font-medium text-center">{steps[currentStep].title}</h2>
    </div>
  );
};

export default VipProgressSteps;
