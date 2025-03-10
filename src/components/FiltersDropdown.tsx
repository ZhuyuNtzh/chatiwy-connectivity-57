
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import { toast } from "@/components/ui/use-toast";

// Define country interface
export interface Country {
  code: string;
  name: string;
  flag: string;
}

// Initialize with basic structure, will be populated with API data
export const countries: Country[] = [];

export type Filters = {
  gender: string[];
  ageRange: [number, number];
  countries: string[];
};

interface FiltersDropdownProps {
  onFiltersChange: (filters: Filters) => void;
}

const FiltersDropdown = ({ onFiltersChange }: FiltersDropdownProps) => {
  const [filters, setFilters] = useState<Filters>({
    gender: ["Male", "Female"],
    ageRange: [18, 80],
    countries: [],
  });
  
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
        const fetchedCountries: Country[] = response.data.map((country: any) => ({
          code: country.cca2,
          name: country.name.common,
          flag: country.flags.svg
        })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        
        // Add Digital option for bots
        fetchedCountries.push({
          code: "Digital",
          name: "Digital",
          flag: "🌐"
        });
        
        setAvailableCountries(fetchedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCountries();
  }, []);
  
  // Update the filters when countries are loaded
  useEffect(() => {
    if (availableCountries.length > 0) {
      onFiltersChange(filters);
    }
  }, [availableCountries, filters, onFiltersChange]);

  const handleGenderChange = (gender: string) => {
    setFilters((prevFilters) => {
      const updatedGenders = prevFilters.gender.includes(gender)
        ? prevFilters.gender.filter((g) => g !== gender)
        : [...prevFilters.gender, gender];
      
      const newFilters = {
        ...prevFilters,
        gender: updatedGenders,
      };
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleMinAgeChange = (value: number[]) => {
    const minAge = value[0];
    const maxAge = filters.ageRange[1];
    
    // Ensure min age doesn't exceed max age
    const adjustedMinAge = Math.min(minAge, maxAge);
    
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        ageRange: [adjustedMinAge, maxAge] as [number, number],
      };
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleMaxAgeChange = (value: number[]) => {
    const minAge = filters.ageRange[0];
    const maxAge = value[0];
    
    // Ensure max age isn't less than min age
    const adjustedMaxAge = Math.max(maxAge, minAge);
    
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        ageRange: [minAge, adjustedMaxAge] as [number, number],
      };
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleCountryChange = (countryName: string) => {
    setFilters((prevFilters) => {
      let updatedCountries = [...prevFilters.countries];
      
      if (prevFilters.countries.includes(countryName)) {
        // Remove country if already selected
        updatedCountries = updatedCountries.filter((c) => c !== countryName);
      } else {
        // Add country if not at the limit
        if (updatedCountries.length < 5) {
          updatedCountries = [...updatedCountries, countryName];
        } else {
          toast({
            title: "Maximum countries reached",
            description: "You can only select up to 5 countries",
            variant: "destructive"
          });
          return prevFilters; // Don't update state if at limit
        }
      }
      
      const newFilters = {
        ...prevFilters,
        countries: updatedCountries,
      };
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Gender</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="male" 
                  checked={filters.gender.includes("Male")} 
                  onCheckedChange={() => handleGenderChange("Male")} 
                />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="female" 
                  checked={filters.gender.includes("Female")} 
                  onCheckedChange={() => handleGenderChange("Female")} 
                />
                <Label htmlFor="female">Female</Label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Minimum Age: {filters.ageRange[0]}</h3>
            <Slider
              defaultValue={[18]}
              min={18}
              max={80}
              step={1}
              value={[filters.ageRange[0]]}
              onValueChange={handleMinAgeChange}
              className="mb-6"
            />
            
            <h3 className="text-sm font-medium mb-2">Maximum Age: {filters.ageRange[1]}</h3>
            <Slider
              defaultValue={[80]}
              min={18}
              max={80}
              step={1}
              value={[filters.ageRange[1]]}
              onValueChange={handleMaxAgeChange}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Countries (Max 5)</h3>
            <p className="text-xs mb-2 text-muted-foreground">
              Selected: {filters.countries.length}/5
            </p>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {availableCountries.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`country-${country.code}`} 
                        checked={filters.countries.includes(country.name)} 
                        onCheckedChange={() => handleCountryChange(country.name)} 
                        disabled={!filters.countries.includes(country.name) && filters.countries.length >= 5}
                      />
                      <Label htmlFor={`country-${country.code}`} className="flex items-center gap-2">
                        {country.code !== "Digital" ? (
                          <img src={country.flag} alt={`${country.name} flag`} className="w-5 h-3 object-cover" />
                        ) : (
                          <span>{country.flag}</span>
                        )}
                        <span>{country.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FiltersDropdown;
