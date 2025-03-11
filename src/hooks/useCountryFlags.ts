
import { useState, useEffect } from 'react';

export const useCountryFlags = () => {
  const [countryFlags, setCountryFlags] = useState<Record<string, string>>({});
  const [connectedUsersCount, setConnectedUsersCount] = useState(0);
  
  useEffect(() => {
    const fetchCountryFlags = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await response.json();
        const flagsMap: Record<string, string> = {};
        
        data.forEach((country: any) => {
          flagsMap[country.name.common] = country.flags.svg;
        });
        
        setCountryFlags(flagsMap);
      } catch (error) {
        console.error('Error fetching country flags:', error);
      }
    };

    fetchCountryFlags();
  }, []);
  
  return {
    countryFlags,
    connectedUsersCount,
    setConnectedUsersCount
  };
};
