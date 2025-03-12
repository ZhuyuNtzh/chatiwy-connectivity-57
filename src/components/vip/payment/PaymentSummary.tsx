
interface PaymentSummaryProps {
  plan: 'monthly' | '6months' | 'yearly';
  onPlanChange: (plan: 'monthly' | '6months' | 'yearly') => void;
}

const PLAN_PRICES = {
  monthly: 4.99,
  '6months': 22.99,
  yearly: 35.99
};

const PLAN_NAMES = {
  monthly: '1 Month',
  '6months': '6 Months',
  yearly: '12 Months'
};

const PaymentSummary = ({ plan, onPlanChange }: PaymentSummaryProps) => {
  const getMonthlyRate = (selectedPlan: keyof typeof PLAN_PRICES) => {
    const price = PLAN_PRICES[selectedPlan];
    return selectedPlan === 'monthly' ? price : (price / (selectedPlan === '6months' ? 6 : 12)).toFixed(2);
  };

  return (
    <div className="bg-muted/20 p-4 rounded-lg space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Select Plan</h3>
        <div className="space-y-2">
          {Object.entries(PLAN_NAMES).map(([key, name]) => (
            <div
              key={key}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                plan === key 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-background hover:bg-secondary/10'
              }`}
              onClick={() => onPlanChange(key as keyof typeof PLAN_PRICES)}
            >
              <div className="flex justify-between items-center">
                <span>{name}</span>
                <span>${PLAN_PRICES[key as keyof typeof PLAN_PRICES]}</span>
              </div>
              <div className="text-sm opacity-80">
                ${getMonthlyRate(key as keyof typeof PLAN_PRICES)}/month
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${PLAN_PRICES[plan]}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
