
interface PaymentSummaryProps {
  subscription: string;
  billing: string;
  total: string;
}

const PaymentSummary = ({ subscription, billing, total }: PaymentSummaryProps) => {
  return (
    <div className="bg-muted/20 p-4 rounded-lg space-y-2">
      <div className="flex justify-between">
        <span>Subscription</span>
        <span>{subscription}</span>
      </div>
      <div className="flex justify-between">
        <span>Billing</span>
        <span>{billing}</span>
      </div>
      <div className="border-t pt-2 mt-2 flex justify-between font-medium">
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
