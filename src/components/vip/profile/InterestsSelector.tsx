
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
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
  maxInterests = 4
}: InterestsSelectorProps) => {
  
  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      // Remove interest if already selected
      onChange(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < maxInterests) {
      // Add interest if not at max
      onChange([...selectedInterests, interest]);
    } else {
      toast({
        title: "Maximum interests reached",
        description: `You can select up to ${maxInterests} interests as a VIP member`,
        variant: "destructive"
      });
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
        {popularInterests.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          const isDisabled = !isSelected && selectedInterests.length >= maxInterests;
          
          return (
            <Button
              key={interest}
              type="button"
              variant={isSelected ? "secondary" : "outline"}
              size="sm"
              className={`justify-start ${isSelected ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-800/60 dark:border-amber-700/50' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleInterestToggle(interest)}
              disabled={isDisabled}
            >
              {isSelected && <Check className="mr-1 h-4 w-4" />}
              <span className="text-sm">{interest}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default InterestsSelector;
