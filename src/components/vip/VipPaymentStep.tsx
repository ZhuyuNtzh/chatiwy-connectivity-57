
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, CreditCard, Paypal, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VipPaymentStepProps {
  formData: any;
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
  
  // Card form state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  });
  
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(.{4})/g, '$1 ')
        .trim();
      
      setCardDetails({ ...cardDetails, [name]: formattedValue });
      return;
    }
    
    // Format CVC
    if (name === 'cvc') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 3);
      setCardDetails({ ...cardDetails, [name]: formattedValue });
      return;
    }
    
    setCardDetails({ ...cardDetails, [name]: value });
  };
  
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month < 10 ? `0${month}` : `${month}`;
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => `${currentYear + i}`);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'card') {
      // Validate card details
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
    
    // Process payment
    setIsProcessing(true);
    
    // Simulate payment processing
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
                  <Paypal size={16} />
                  <span>PayPal</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="card" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input
                    id="cardName"
                    name="cardName"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={handleCardChange}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Exp Month</Label>
                    <Select 
                      value={cardDetails.expMonth} 
                      onValueChange={(value) => setCardDetails({...cardDetails, expMonth: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exp Year</Label>
                    <Select 
                      value={cardDetails.expYear} 
                      onValueChange={(value) => setCardDetails({...cardDetails, expYear: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      name="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={handleCardChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center mt-4 p-2 rounded bg-primary/5 text-sm">
                  <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                  <span>Your payment is secured with industry-standard encryption</span>
                </div>
              </TabsContent>
              
              <TabsContent value="paypal" className="space-y-4 mt-4">
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <Paypal size={48} className="mx-auto mb-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to PayPal to complete your payment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="bg-muted/20 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subscription</span>
              <span>VIP Membership</span>
            </div>
            <div className="flex justify-between">
              <span>Billing</span>
              <span>Monthly</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>$4.99/month</span>
            </div>
          </div>
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
