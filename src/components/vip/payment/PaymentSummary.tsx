
interface PaymentSummaryProps {
  plan: 'monthly' | '6months' | 'yearly';
}

const PLAN_PRICES = {
  monthly: 4.99,
  '6months': 24.99,
  yearly: 49.99
};

const PLAN_NAMES = {
  monthly: '1 Month',
  '6months': '6 Months',
  yearly: '12 Months'
};

const PaymentSummary = ({ plan }: PaymentSummaryProps) => {
  const price = PLAN_PRICES[plan];
  const planName = PLAN_NAMES[plan];
  const monthlyRate = plan === 'monthly' ? price : (price / (plan === '6months' ? 6 : 12)).toFixed(2);

  return (
    <div className="bg-muted/20 p-4 rounded-lg space-y-2">
      <div className="flex justify-between">
        <span>VIP Membership</span>
        <span>{planName}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Monthly Rate</span>
        <span>${monthlyRate}/month</span>
      </div>
      <div className="border-t pt-2 mt-2 flex justify-between font-medium">
        <span>Total</span>
        <span>${price}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
