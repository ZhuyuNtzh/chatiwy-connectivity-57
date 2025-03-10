
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// List of countries for the country filter
const countries = [
  { code: "TR", name: "Turkey" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
];

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
    ageRange: [18, 65],
    countries: [],
  });

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

  const handleAgeRangeChange = (value: number[]) => {
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        ageRange: [value[0], value[1]],
      };
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleCountryChange = (country: string) => {
    setFilters((prevFilters) => {
      let updatedCountries;
      
      if (prevFilters.countries.includes(country)) {
        updatedCountries = prevFilters.countries.filter((c) => c !== country);
      } else {
        updatedCountries = [...prevFilters.countries, country];
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
            <h3 className="text-sm font-medium mb-2">Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</h3>
            <div className="pt-4 px-1">
              <Slider
                defaultValue={[18, 65]}
                min={18}
                max={65}
                step={1}
                value={[filters.ageRange[0], filters.ageRange[1]]}
                onValueChange={handleAgeRangeChange}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Countries</h3>
            <div className="grid grid-cols-2 gap-2">
              {countries.map((country) => (
                <div key={country.code} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`country-${country.code}`} 
                    checked={filters.countries.includes(country.code)} 
                    onCheckedChange={() => handleCountryChange(country.code)} 
                  />
                  <Label htmlFor={`country-${country.code}`}>{country.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FiltersDropdown;
