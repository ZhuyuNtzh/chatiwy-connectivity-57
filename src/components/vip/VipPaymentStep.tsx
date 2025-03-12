
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, WalletCards, ChevronLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CardPaymentForm from './payment/CardPaymentForm';
import PaymentSummary from './payment/PaymentSummary';

interface VipPaymentStepProps {
  formData: {
    plan: 'monthly' | '6months' | 'yearly';
  };
  onBack: () => void;
  onComplete: () => void;
}

const VipPaymentStep = ({
  formData,
  onBack,
  onComplete
}: VipPaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expMonth || 
          !cardDetails.expYear || !cardDetails.cvc) {
        toast({
          title: "Missing card details",
          description: "Please fill in all required card information",
          variant: "destructive"
        });
        return;
      }
      
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid 16-digit card number",
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 1500);
  };
  
  return (
    <Card className="w-full shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium">Select Payment Method</h3>
              <p className="text-sm text-muted-foreground">
                Secure payment processed by Stripe
              </p>
            </div>
            
            <Tabs 
              defaultValue="card" 
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'card' | 'paypal')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard size={16} />
                  <span>Credit Card</span>
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <WalletCards size={16} />
                  <span>PayPal</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="card" className="space-y-4 mt-4">
                <CardPaymentForm
                  cardDetails={cardDetails}
                  onChange={(details) => setCardDetails(prev => ({ ...prev, ...details }))}
                />
              </TabsContent>
              
              <TabsContent value="paypal" className="space-y-4 mt-4">
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <WalletCards size={48} className="mx-auto mb-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to PayPal to complete your payment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <PaymentSummary plan={formData.plan} />
        </CardContent>
        
        <CardFooter className="flex justify-between space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
            className="w-1/2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-1/2 bg-secondary hover:bg-secondary/90"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default VipPaymentStep;
