
import { Label } from '@/components/ui/label';

interface Country {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
}

interface CountryDisplayProps {
  country: Country | null;
  location: string;
  setLocation: (location: string) => void;
  isLoading: boolean;
  userRole: string | null;
}

const CountryDisplay = ({ 
  country, 
  location, 
  setLocation, 
  isLoading,
  userRole
}: CountryDisplayProps) => {
  return (
    <div className="space-y-1">
      <Label htmlFor="location" className="text-gray-800">Country</Label>
      
      {isLoading ? (
        <div className="bg-white/70 rounded-md px-3 py-2 border border-input flex items-center space-x-2">
          <div className="w-6 h-4 bg-gray-200 animate-pulse"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      ) : country ? (
        <div className="flex items-center space-x-2 bg-white/70 rounded-md px-3 py-2 border border-input">
          <img 
            src={country.flags.svg} 
            alt={`${country.name.common} flag`} 
            className="w-6 h-4 object-cover"
          />
          <span className="text-gray-800">{country.name.common}</span>
        </div>
      ) : (
        <div className="bg-white/70 rounded-md px-3 py-2 border border-input">
          Unable to detect country
        </div>
      )}
    </div>
  );
};

export default CountryDisplay;
