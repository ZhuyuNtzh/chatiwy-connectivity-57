
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import GenderSelector from './profile/GenderSelector';
import AvatarSelector from './profile/AvatarSelector';
import { Checkbox } from '@/components/ui/checkbox';
import InterestsSelector from './profile/InterestsSelector';
import CountrySelector from './profile/CountrySelector';
import AgeSelector from './profile/AgeSelector';

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

const VipProfileStep = ({
  formData,
  updateFormData,
  onNext,
  onBack
}: VipProfileStepProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
        const sortedCountries = response.data.sort((a: any, b: any) => 
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.gender) {
      toast.error("Gender selection is required");
      return;
    }
    
    if (!formData.age) {
      toast.error("Age selection is required");
      return;
    }
    
    if (!formData.country) {
      toast.error("Country required");
      return;
    }
    
    onNext();
  };
  
  return (
    <Card className="w-full shadow-lg dark:bg-gray-800 dark:border-gray-700">
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
          
          <AgeSelector 
            age={formData.age}
            onChange={(value) => updateFormData({ age: value })}
          />
          
          <CountrySelector
            country={formData.country}
            onChange={(value) => updateFormData({ country: value })}
            countries={countries}
            isLoading={isLoading}
          />
          
          <InterestsSelector
            selectedInterests={formData.interests}
            onChange={(interests) => updateFormData({ interests })}
            maxInterests={4}
          />
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
            className="w-1/2 bg-secondary hover:bg-secondary/90 dark:bg-amber-500 dark:hover:bg-amber-600"
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
