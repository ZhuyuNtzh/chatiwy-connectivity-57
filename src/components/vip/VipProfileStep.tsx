
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import GenderSelector from './profile/GenderSelector';
import AvatarSelector from './profile/AvatarSelector';

interface VipProfileFormData {
  gender: string;
  interests: string[];
  country: string;
  age: string;
  avatar: string;
}

interface VipProfileStepProps {
  formData: VipProfileFormData;
  updateFormData: (data: Partial<VipProfileFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Country {
  name: { common: string };
  flags: { svg: string };
  cca2: string;
}

const popularInterests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Learning Languages', 'Photography', 'Cooking', 'Fitness'
];

const ageOptions = Array.from({ length: 63 }, (_, i) => String(18 + i));

const VipProfileStep = ({
  formData,
  updateFormData,
  onNext,
  onBack
}: VipProfileStepProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const MAX_INTERESTS = 4;
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
        const sortedCountries = response.data.sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          title: "Error",
          description: "Failed to load countries list",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCountries();
  }, []);
  
  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      if (formData.interests.length < MAX_INTERESTS) {
        updateFormData({ 
          interests: [...formData.interests, interest] 
        });
      } else {
        toast({
          title: "Maximum interests reached",
          description: `You can select up to ${MAX_INTERESTS} interests`,
          variant: "destructive"
        });
      }
    } else {
      updateFormData({ 
        interests: formData.interests.filter(i => i !== interest) 
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.gender) {
      toast({
        title: "Missing gender",
        description: "Please select your gender",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.interests.length < 1) {
      toast({
        title: "Interests required",
        description: "Please select at least one interest",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.country) {
      toast({
        title: "Country required",
        description: "Please select your country",
        variant: "destructive"
      });
      return;
    }
    
    onNext();
  };
  
  return (
    <Card className="w-full shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <GenderSelector 
            value={formData.gender}
            onChange={(value) => updateFormData({ gender: value })}
          />
          
          <AvatarSelector
            selectedAvatar={formData.avatar}
            onSelect={(avatarSrc) => updateFormData({ avatar: avatarSrc })}
          />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Age</Label>
              <span className="text-sm text-muted-foreground">{formData.age} years old</span>
            </div>
            <Select 
              value={formData.age} 
              onValueChange={(value) => updateFormData({ age: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select age" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map((age) => (
                  <SelectItem key={age} value={age}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Country</Label>
            <Select 
              value={formData.country} 
              onValueChange={(value) => updateFormData({ country: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoading ? "Loading countries..." : "Select country"} />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {countries.map((country) => (
                  <SelectItem key={country.cca2} value={country.name.common} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={country.flags.svg} 
                        alt={`${country.name.common} flag`} 
                        className="w-5 h-3 object-cover"
                      />
                      {country.name.common}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Interests</Label>
              <span className="text-sm text-muted-foreground">
                {formData.interests.length}/{MAX_INTERESTS}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularInterests.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={(checked) => 
                      handleInterestChange(interest, checked as boolean)
                    }
                    className="data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                    disabled={
                      !formData.interests.includes(interest) && 
                      formData.interests.length >= MAX_INTERESTS
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
        </CardContent>
        
        <CardFooter className="flex justify-between space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            className="w-1/2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-1/2 bg-secondary hover:bg-secondary/90"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default VipProfileStep;
