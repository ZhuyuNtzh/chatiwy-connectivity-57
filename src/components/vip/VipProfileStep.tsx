
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

const avatarOptions = [
  { id: 'avatar1', src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 1' },
  { id: 'avatar2', src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 2' },
  { id: 'avatar3', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 3' },
  { id: 'avatar4', src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 4' },
  { id: 'avatar5', src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&h=100', alt: 'Avatar 5' },
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
      updateFormData({ 
        interests: [...formData.interests, interest] 
      });
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
          <div className="space-y-3">
            <Label>Gender</Label>
            <RadioGroup 
              value={formData.gender} 
              onValueChange={(value) => updateFormData({ gender: value })}
              className="flex gap-4 justify-center"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="male" className="sr-only" />
                <Label
                  htmlFor="male"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
                    formData.gender === 'Male' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-background border-2 border-muted hover:bg-muted/20'
                  }`}
                >
                  <User2 size={36} className={formData.gender === 'Male' ? 'text-primary' : 'text-foreground'} />
                  <span className="mt-2 font-medium">Male</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="female" className="sr-only" />
                <Label
                  htmlFor="female"
                  className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
                    formData.gender === 'Female' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-background border-2 border-muted hover:bg-muted/20'
                  }`}
                >
                  <Users size={36} className={formData.gender === 'Female' ? 'text-primary' : 'text-foreground'} />
                  <span className="mt-2 font-medium">Female</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Select Avatar</Label>
            <div className="flex flex-wrap gap-4 justify-center">
              {avatarOptions.map((avatar) => (
                <div 
                  key={avatar.id}
                  onClick={() => updateFormData({ avatar: avatar.src })}
                  className={`cursor-pointer transition-all ${
                    formData.avatar === avatar.src 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'hover:opacity-80'
                  }`}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatar.src} alt={avatar.alt} />
                    <AvatarFallback>
                      <User2 className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
            </div>
          </div>
          
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
                {formData.interests.length} selected
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
