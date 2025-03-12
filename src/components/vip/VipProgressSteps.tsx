
interface VipProgressStepsProps {
  steps: Array<{ title: string }>;
  currentStep: number;
}

const VipProgressSteps = ({ steps, currentStep }: VipProgressStepsProps) => {
  return (
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
  );
};

export default VipProgressSteps;
