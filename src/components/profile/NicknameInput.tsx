
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { signalRService } from '@/services/signalRService';

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
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  
  // Load banned words
  useEffect(() => {
    try {
      const words = signalRService.getBannedWords();
      setBannedWords(words);
    } catch (error) {
      console.error("Error loading banned words:", error);
    }
  }, []);
  
  const validateNickname = (value: string): boolean => {
    // Check for "admin" in any case variation (case-insensitive)
    const adminPattern = /admin/i;
    if (adminPattern.test(value)) {
      return false;
    }
    
    // Check for more than 3 consecutive numbers
    const consecutiveNumbersPattern = /\d{4,}/;
    if (consecutiveNumbersPattern.test(value)) {
      return false;
    }
    
    // Check for alphanumeric characters only
    const alphanumericPattern = /^[a-zA-Z0-9]*$/;
    if (!alphanumericPattern.test(value)) {
      return false;
    }
    
    // Check for banned words
    if (bannedWords.length > 0) {
      const lowerValue = value.toLowerCase();
      for (const word of bannedWords) {
        if (lowerValue.includes(word.toLowerCase())) {
          return false;
        }
      }
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
        // Check for banned words
        const lowerValue = value.toLowerCase();
        const hasBannedWord = bannedWords.some(word => 
          lowerValue.includes(word.toLowerCase())
        );
        
        if (hasBannedWord) {
          toast({
            title: "Invalid nickname",
            description: "Your nickname contains inappropriate content",
            variant: "destructive"
          });
        }
        // Check for admin specifically to give a more specific error message
        else if (/admin/i.test(value)) {
          toast({
            title: "Invalid nickname",
            description: "The word 'admin' is not allowed in any form",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Invalid nickname",
            description: "Nickname must be alphanumeric with no more than 3 consecutive numbers",
            variant: "destructive"
          });
        }
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
