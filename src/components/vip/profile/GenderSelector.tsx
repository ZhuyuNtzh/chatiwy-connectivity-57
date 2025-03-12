
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GenderSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const GenderSelector = ({ value, onChange }: GenderSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Gender</Label>
      <div className="flex gap-4 justify-center">
        <Button
          variant={value === 'Male' ? 'default' : 'outline'}
          className="flex-1 h-auto py-3"
          onClick={() => onChange('Male')}
        >
          Male
        </Button>
        
        <Button
          variant={value === 'Female' ? 'default' : 'outline'}
          className="flex-1 h-auto py-3"
          onClick={() => onChange('Female')}
        >
          Female
        </Button>
      </div>
    </div>
  );
};

export default GenderSelector;
