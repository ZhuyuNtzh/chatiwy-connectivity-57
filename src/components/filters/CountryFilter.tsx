
import { Button } from "@/components/ui/button";

interface CountryFilterProps {
  selectedCountries: string[];
  countries: { name: string; flag: string }[];
  onCountryChange: (country: string) => void;
  isLoading: boolean;
}

const CountryFilter = ({ selectedCountries, countries, onCountryChange, isLoading }: CountryFilterProps) => {
  const isCountryActive = (country: string) => selectedCountries.includes(country);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        Country {selectedCountries.length > 0 && `(${selectedCountries.length}/5)`}
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
                onClick={() => onCountryChange(country.name)}
                disabled={!isCountryActive(country.name) && selectedCountries.length >= 5}
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
      {selectedCountries.length >= 5 && (
        <div className="text-xs text-amber-500">
          Maximum of 5 countries can be selected
        </div>
      )}
    </div>
  );
};

export default CountryFilter;
