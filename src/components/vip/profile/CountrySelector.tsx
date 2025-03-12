
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountrySelectorProps {
  country: string;
  onChange: (value: string) => void;
  countries: any[];
  isLoading: boolean;
}

const CountrySelector = ({
  country,
  onChange,
  countries,
  isLoading
}: CountrySelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Country</Label>
      <Select 
        value={country} 
        onValueChange={onChange}
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
  );
};

export default CountrySelector;
