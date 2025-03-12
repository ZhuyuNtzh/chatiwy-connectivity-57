
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User2, Users } from 'lucide-react';

interface GenderSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const GenderSelector = ({ value, onChange }: GenderSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Gender</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="flex gap-4 justify-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Male" id="male" className="sr-only" />
          <Label
            htmlFor="male"
            className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
              value === 'Male' 
                ? 'bg-primary/10 border-2 border-primary' 
                : 'bg-background border-2 border-muted hover:bg-muted/20'
            }`}
          >
            <User2 size={36} className={value === 'Male' ? 'text-primary' : 'text-foreground'} />
            <span className="mt-2 font-medium">Male</span>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Female" id="female" className="sr-only" />
          <Label
            htmlFor="female"
            className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
              value === 'Female' 
                ? 'bg-primary/10 border-2 border-primary' 
                : 'bg-background border-2 border-muted hover:bg-muted/20'
            }`}
          >
            <Users size={36} className={value === 'Female' ? 'text-primary' : 'text-foreground'} />
            <span className="mt-2 font-medium">Female</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default GenderSelector;
