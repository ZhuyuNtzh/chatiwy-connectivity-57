
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from 'lucide-react';
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
  
  const [countries, setCountries] = useState<{name: string, flag: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Close the popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isOpen]);
  
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
    if (filters.countries.includes(country)) {
      const newFilters = {
        ...filters,
        countries: filters.countries.filter(c => c !== country)
      };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    } else {
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

  // Toggle popover state
  const togglePopover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const closePopover = () => {
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
            onClick={togglePopover}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 bg-white dark:bg-gray-800 z-[100]" 
          align="end"
          sideOffset={5}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <GenderFilter 
              selectedGenders={filters.gender}
              onGenderChange={handleGenderChange}
            />
            
            <AgeRangeFilter 
              ageRange={filters.ageRange}
              onAgeChange={handleAgeChange}
            />
            
            <CountryFilter 
              selectedCountries={filters.countries}
              countries={countries}
              onCountryChange={handleCountryChange}
              isLoading={isLoading}
            />
            
            <div className="pt-2 text-right">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFilters();
                  closePopover();
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FiltersDropdown;
