
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck } from 'lucide-react';

interface CardDetails {
  cardNumber: string;
  cardName: string;
  expMonth: string;
  expYear: string;
  cvc: string;
}

interface CardPaymentFormProps {
  cardDetails: CardDetails;
  onChange: (details: Partial<CardDetails>) => void;
}

const CardPaymentForm = ({ cardDetails, onChange }: CardPaymentFormProps) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month < 10 ? `0${month}` : `${month}`;
  });
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => `${currentYear + i}`);
  
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(.{4})/g, '$1 ')
        .trim();
      
      onChange({ [name]: formattedValue });
      return;
    }
    
    if (name === 'cvc') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 3);
      onChange({ [name]: formattedValue });
      return;
    }
    
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
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
            onValueChange={(value) => onChange({ expMonth: value })}
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
            onValueChange={(value) => onChange({ expYear: value })}
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
    </div>
  );
};

export default CardPaymentForm;
