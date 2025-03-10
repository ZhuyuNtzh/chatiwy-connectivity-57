
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Filter } from 'lucide-react';
import axios from 'axios';

export interface Filters {
  gender: string[];
  ageRange: [number, number];
  countries: string[];
}

interface FiltersDropdownProps {
  onFiltersChange: (filters: Filters) => void;
}

const FiltersDropdown = ({ onFiltersChange }: FiltersDropdownProps) => {
  const [filters, setFilters] = useState<Filters>({
    gender: ["Male", "Female"],
    ageRange: [18, 80] as [number, number],
    countries: [],
  });
  
  const [countries, setCountries] = useState<{name: string, flag: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags');
        const formattedCountries = response.data.map((country: any) => ({
          name: country.name.common,
          flag: country.flags.svg,
        })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        setCountries(formattedCountries);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setIsLoading(false);
      }
    };
    
    fetchCountries();
  }, []);
  
  const handleGenderChange = (gender: string) => {
    const updatedGenders = filters.gender.includes(gender)
      ? filters.gender.filter(g => g !== gender)
      : [...filters.gender, gender];
    
    // Ensure we always have at least one gender selected
    if (updatedGenders.length === 0) return;
    
    const newFilters = { ...filters, gender: updatedGenders };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };
  
  const handleAgeChange = (value: number[]) => {
    const newFilters = { 
      ...filters, 
      ageRange: [value[0], value[1]] as [number, number]
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };
  
  const handleCountryChange = (country: string) => {
    // Check if the country is already selected
    if (filters.countries.includes(country)) {
      // Remove the country
      const newFilters = {
        ...filters,
        countries: filters.countries.filter(c => c !== country)
      };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    } else {
      // Add the country, but only if we haven't reached 5 countries yet
      if (filters.countries.length < 5) {
        const newFilters = {
          ...filters,
          countries: [...filters.countries, country]
        };
        setFilters(newFilters);
        onFiltersChange(newFilters);
      }
    }
  };
  
  const clearFilters = () => {
    const resetFilters: Filters = {
      gender: ["Male", "Female"],
      ageRange: [18, 80] as [number, number],
      countries: [],
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };
  
  const isGenderActive = (gender: string) => filters.gender.includes(gender);
  
  const isCountryActive = (country: string) => filters.countries.includes(country);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 bg-white dark:bg-gray-800 px-2"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Gender</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isGenderActive("Male") ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenderChange("Male")}
              >
                Male
              </Button>
              <Button
                variant={isGenderActive("Female") ? "default" : "outline"}
                size="sm"
                onClick={() => handleGenderChange("Female")}
              >
                Female
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</div>
            <Slider
              defaultValue={[18, 80]}
              min={18}
              max={80}
              step={1}
              value={[filters.ageRange[0], filters.ageRange[1]]}
              onValueChange={handleAgeChange}
              className="py-4"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Country {filters.countries.length > 0 && `(${filters.countries.length}/5)`}
            </div>
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading countries...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto pr-2 -mr-2">
                <div className="grid grid-cols-1 gap-1.5">
                  {countries.map((country) => (
                    <Button
                      key={country.name}
                      variant={isCountryActive(country.name) ? "default" : "outline"}
                      size="sm"
                      className="justify-start h-8"
                      onClick={() => handleCountryChange(country.name)}
                      disabled={!isCountryActive(country.name) && filters.countries.length >= 5}
                    >
                      <img 
                        src={country.flag} 
                        alt={`${country.name} flag`} 
                        className="w-4 h-3 mr-2 object-cover"
                      />
                      {country.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {filters.countries.length >= 5 && (
              <div className="text-xs text-amber-500">
                Maximum of 5 countries can be selected
              </div>
            )}
          </div>
          
          <div className="pt-2 text-right">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FiltersDropdown;
