
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InterestsSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  maxInterests: number;
  userRole: string | null;
}

// A curated list of the most popular interests
const popularInterests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Learning Languages', 'Photography', 'Cooking', 'Fitness'
];

const InterestsSelector = ({ 
  selectedInterests, 
  onChange, 
  maxInterests,
  userRole
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
        description: `You can select up to ${maxInterests} interests`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-800 dark:text-gray-200 flex justify-between items-center">
        <span>Interests (Select up to {maxInterests})</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">{selectedInterests.length}/{maxInterests}</span>
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
              className={`justify-start h-8 px-2 py-1 text-xs font-normal ${
                isSelected ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/40 dark:text-orange-200 dark:hover:bg-orange-800/60 dark:border-orange-700/50' : ''
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleInterestToggle(interest)}
              disabled={isDisabled}
            >
              {isSelected && <Check className="mr-1 h-3 w-3" />}
              {interest}
            </Button>
          );
        })}
      </div>
      
      {userRole === 'standard' && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Upgrade to VIP to select more interests
        </p>
      )}
    </div>
  );
};

export default InterestsSelector;
