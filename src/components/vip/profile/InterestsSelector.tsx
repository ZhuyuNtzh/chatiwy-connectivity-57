
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface InterestsSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  maxInterests: number;
}

const popularInterests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Learning Languages', 'Photography', 'Cooking', 'Fitness'
];

const InterestsSelector = ({
  selectedInterests,
  onChange,
  maxInterests
}: InterestsSelectorProps) => {
  
  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      if (selectedInterests.length < maxInterests) {
        onChange([...selectedInterests, interest]);
      } else {
        toast({
          title: "Maximum interests reached",
          description: `You can select up to ${maxInterests} interests`,
          variant: "destructive"
        });
      }
    } else {
      onChange(selectedInterests.filter(i => i !== interest));
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Interests</Label>
        <span className="text-sm text-muted-foreground">
          {selectedInterests.length}/{maxInterests}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {popularInterests.map((interest) => (
          <div key={interest} className="flex items-center space-x-2">
            <Checkbox
              id={`interest-${interest}`}
              checked={selectedInterests.includes(interest)}
              onCheckedChange={(checked) => 
                handleInterestChange(interest, checked as boolean)
              }
              className="data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
              disabled={
                !selectedInterests.includes(interest) && 
                selectedInterests.length >= maxInterests
              }
            />
            <Label
              htmlFor={`interest-${interest}`}
              className="text-sm font-normal cursor-pointer"
            >
              {interest}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestsSelector;
