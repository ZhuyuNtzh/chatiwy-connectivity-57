
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface NicknameInputProps {
  nickname: string;
  onChange: (value: string) => void;
  isVip?: boolean;
  readOnly?: boolean;
}

const NicknameInput: React.FC<NicknameInputProps> = ({ 
  nickname, 
  onChange, 
  isVip = false,
  readOnly = false
}) => {
  const maxLength = isVip ? 24 : 20;
  const [isValid, setIsValid] = useState(true);
  
  const validateNickname = (value: string): boolean => {
    // Check for more than 2 consecutive numbers
    const consecutiveNumbersPattern = /\d{3,}/;
    if (consecutiveNumbersPattern.test(value)) {
      return false;
    }
    
    // Check for alphanumeric characters only
    const alphanumericPattern = /^[a-zA-Z0-9]*$/;
    if (!alphanumericPattern.test(value)) {
      return false;
    }
    
    return true;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      const isValidInput = validateNickname(value);
      setIsValid(isValidInput);
      
      if (isValidInput) {
        onChange(value);
      } else {
        toast({
          title: "Invalid nickname",
          description: "Nickname must be alphanumeric with no more than 2 consecutive numbers",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="nickname" className="text-gray-800">Nickname</Label>
        <span className="text-sm text-muted-foreground">{nickname.length}/{maxLength}</span>
      </div>
      <Input
        id="nickname"
        value={nickname}
        onChange={handleChange}
        readOnly={readOnly}
        className={`${!isValid ? 'border-red-500' : ''} ${readOnly ? 'bg-gray-100 text-gray-800' : ''}`}
        required
      />
    </div>
  );
};

export default NicknameInput;
