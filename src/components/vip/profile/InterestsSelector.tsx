
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface InterestsSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
}

const popularInterests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Learning Languages', 'Photography', 'Cooking', 'Fitness'
];

const VipInterestsSelector = ({ selectedInterests, onChange }: InterestsSelectorProps) => {
  const MAX_INTERESTS = 4;
  
  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked && selectedInterests.length >= MAX_INTERESTS) {
      return;
    }
    
    if (checked) {
      onChange([...selectedInterests, interest]);
    } else {
      onChange(selectedInterests.filter(i => i !== interest));
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Interests</Label>
        <span className="text-sm text-muted-foreground">
          {selectedInterests.length}/{MAX_INTERESTS}
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
              disabled={
                !selectedInterests.includes(interest) && 
                selectedInterests.length >= MAX_INTERESTS
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

export default VipInterestsSelector;
