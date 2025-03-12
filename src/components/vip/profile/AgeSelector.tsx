
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgeSelectorProps {
  age: string;
  onChange: (value: string) => void;
}

const ageOptions = Array.from({ length: 63 }, (_, i) => String(18 + i));

const AgeSelector = ({ age, onChange }: AgeSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Age</Label>
        <span className="text-sm text-muted-foreground">{age} years old</span>
      </div>
      <Select 
        value={age} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select age" />
        </SelectTrigger>
        <SelectContent>
          {ageOptions.map((ageOption) => (
            <SelectItem key={ageOption} value={ageOption}>
              {ageOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AgeSelector;
