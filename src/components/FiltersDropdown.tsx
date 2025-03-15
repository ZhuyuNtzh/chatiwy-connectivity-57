
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, CheckCircle } from 'lucide-react';
import axios from 'axios';
import GenderFilter from './filters/GenderFilter';
import AgeRangeFilter from './filters/AgeRangeFilter';
import CountryFilter from './filters/CountryFilter';

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
  
  const [tempFilters, setTempFilters] = useState<Filters>({
    gender: ["Male", "Female"],
    ageRange: [18, 80] as [number, number],
    countries: [],
  });
  
  const [countries, setCountries] = useState<{name: string, flag: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Initialize tempFilters when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setTempFilters({...filters});
    }
  }, [isOpen, filters]);
  
  // Load countries when component mounts
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
    const updatedGenders = tempFilters.gender.includes(gender)
      ? tempFilters.gender.filter(g => g !== gender)
      : [...tempFilters.gender, gender];
    
    if (updatedGenders.length === 0) return;
    
    setTempFilters({ ...tempFilters, gender: updatedGenders });
  };
  
  const handleAgeChange = (value: number[]) => {
    setTempFilters({ 
      ...tempFilters, 
      ageRange: [value[0], value[1]] as [number, number]
    });
  };
  
  const handleCountryChange = (country: string) => {
    if (tempFilters.countries.includes(country)) {
      setTempFilters({
        ...tempFilters,
        countries: tempFilters.countries.filter(c => c !== country)
      });
    } else {
      if (tempFilters.countries.length < 5) {
        setTempFilters({
          ...tempFilters,
          countries: [...tempFilters.countries, country]
        });
      }
    }
  };
  
  const clearFilters = () => {
    const resetFilters: Filters = {
      gender: ["Male", "Female"],
      ageRange: [18, 80] as [number, number],
      countries: [],
    };
    setTempFilters(resetFilters);
  };
  
  const applyFilters = () => {
    setFilters(tempFilters);
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  return (
    <div ref={popoverRef}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-white dark:bg-gray-800 px-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 bg-white dark:bg-gray-800 z-[100]" 
          align="end"
          sideOffset={5}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <GenderFilter 
              selectedGenders={tempFilters.gender}
              onGenderChange={handleGenderChange}
            />
            
            <AgeRangeFilter 
              ageRange={tempFilters.ageRange}
              onAgeChange={handleAgeChange}
            />
            
            <CountryFilter 
              selectedCountries={tempFilters.countries}
              countries={countries}
              onCountryChange={handleCountryChange}
              isLoading={isLoading}
            />
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFilters();
                }}
              >
                Clear All
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyFilters();
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FiltersDropdown;
