
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

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
  
  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      if (selectedInterests.length < maxInterests) {
        onChange([...selectedInterests, interest]);
      }
    } else {
      onChange(selectedInterests.filter(i => i !== interest));
    }
  };
  
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-800 flex justify-between items-center">
        <span>Interests (Select up to {maxInterests})</span>
        <span className="text-xs text-gray-600">{selectedInterests.length}/{maxInterests}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        {popularInterests.map((interest) => (
          <div key={interest} className="flex items-center space-x-1">
            <Checkbox
              id={`interest-${interest}`}
              checked={selectedInterests.includes(interest)}
              onCheckedChange={(checked) => 
                handleInterestChange(interest, checked as boolean)
              }
              disabled={
                !selectedInterests.includes(interest) && 
                selectedInterests.length >= maxInterests
              }
              className="border-[#FB9E41] text-[#FB9E41] data-[state=checked]:bg-[#FB9E41] data-[state=checked]:text-white"
            />
            <label
              htmlFor={`interest-${interest}`}
              className="text-xs font-medium leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {interest}
            </label>
          </div>
        ))}
      </div>
      
      {userRole === 'standard' && (
        <p className="text-xs text-gray-600 mt-1">
          Upgrade to VIP to select more interests
        </p>
      )}
    </div>
  );
};

export default InterestsSelector;
