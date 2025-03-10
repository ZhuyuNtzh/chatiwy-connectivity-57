
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

// Full list of countries with flags (this is just a sample, you should include all countries)
const countries = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  // ... Add all countries here
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼" },
].sort((a, b) => a.name.localeCompare(b.name));

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
    const ageRangeValue: [number, number] = [value[0], value[1]];
    
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        ageRange: ageRangeValue,
      };
      
      onFiltersChange(newFilters);
      return newFilters;
    });
  };

  const handleCountryChange = (country: string) => {
    setFilters((prevFilters) => {
      const updatedCountries = prevFilters.countries.includes(country)
        ? prevFilters.countries.filter((c) => c !== country)
        : [...prevFilters.countries, country];
      
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
              onValueChange={(value) => handleAgeRangeChange([value[0], filters.ageRange[1]])}
              className="mb-6"
            />
            
            <h3 className="text-sm font-medium mb-2">Maximum Age: {filters.ageRange[1]}</h3>
            <Slider
              defaultValue={[80]}
              min={18}
              max={80}
              step={1}
              value={[filters.ageRange[1]]}
              onValueChange={(value) => handleAgeRangeChange([filters.ageRange[0], value[0]])}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Countries</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {countries.map((country) => (
                  <div key={country.code} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`country-${country.code}`} 
                      checked={filters.countries.includes(country.code)} 
                      onCheckedChange={() => handleCountryChange(country.code)} 
                    />
                    <Label htmlFor={`country-${country.code}`} className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FiltersDropdown;
