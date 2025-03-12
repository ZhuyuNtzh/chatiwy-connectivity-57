
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User2, Users } from 'lucide-react';

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
          className="flex-1 h-auto py-6 flex flex-col items-center gap-2"
          onClick={() => onChange('Male')}
        >
          <User2 size={36} />
          <span>Male</span>
        </Button>
        
        <Button
          variant={value === 'Female' ? 'default' : 'outline'}
          className="flex-1 h-auto py-6 flex flex-col items-center gap-2"
          onClick={() => onChange('Female')}
        >
          <Users size={36} />
          <span>Female</span>
        </Button>
      </div>
    </div>
  );
};

export default GenderSelector;
