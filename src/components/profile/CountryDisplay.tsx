
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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
  isEditable?: boolean;
}

const CountryDisplay = ({ 
  country, 
  location, 
  setLocation, 
  isLoading,
  userRole,
  isEditable = false
}: CountryDisplayProps) => {
  const [customLocation, setCustomLocation] = useState(location);
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value;
    setCustomLocation(newLocation);
    setLocation(newLocation);
  };
  
  return (
    <div className="space-y-1">
      <Label htmlFor="location" className="text-gray-800">Country</Label>
      
      {isLoading ? (
        <div className="bg-white/70 rounded-md px-3 py-2 border border-input flex items-center space-x-2">
          <div className="w-6 h-4 bg-gray-200 animate-pulse"></div>
          <span className="text-gray-400">Loading...</span>
        </div>
      ) : country && !isEditable ? (
        // Non-editable display for standard users
        <div className="flex items-center space-x-2 bg-white/70 rounded-md px-3 py-2 border border-input">
          <img 
            src={country.flags.svg} 
            alt={`${country.name.common} flag`} 
            className="w-6 h-4 object-cover"
          />
          <span className="text-gray-800">{country.name.common}</span>
        </div>
      ) : country && isEditable ? (
        // Editable field for VIP users
        <div className="flex items-center space-x-2">
          <div className="w-10 flex-shrink-0 bg-white/70 rounded-l-md px-2 py-2 border border-r-0 border-input">
            <img 
              src={country.flags.svg} 
              alt={`${country.name.common} flag`} 
              className="w-6 h-4 object-cover"
            />
          </div>
          <Input
            value={customLocation}
            onChange={handleLocationChange}
            className="flex-1 rounded-l-none bg-white/70 text-gray-800"
          />
        </div>
      ) : (
        <div className="bg-white/70 rounded-md px-3 py-2 border border-input">
          Unable to detect country
        </div>
      )}
      
      {isEditable && userRole === 'vip' && (
        <p className="text-xs text-gray-500 italic mt-1">
          As a VIP member, you can customize your location
        </p>
      )}
    </div>
  );
};

export default CountryDisplay;
