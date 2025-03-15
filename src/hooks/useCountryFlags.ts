
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
        setCountryFlags(getFallbackFlags());
      }
    };

    fetchCountryFlags();
    
    // Set a more realistic connected user count (8-15)
    setConnectedUsersCount(Math.floor(Math.random() * 8) + 8);
  }, []);
  
  return {
    countryFlags,
    connectedUsersCount,
    setConnectedUsersCount
  };
};

// Helper function to get fallback flags
function getFallbackFlags(): Record<string, string> {
  return {
    "United States": "https://flagcdn.com/us.svg",
    "France": "https://flagcdn.com/fr.svg",
    "United Kingdom": "https://flagcdn.com/gb.svg",
    "Germany": "https://flagcdn.com/de.svg",
    "Japan": "https://flagcdn.com/jp.svg",
    "Canada": "https://flagcdn.com/ca.svg",
    "Australia": "https://flagcdn.com/au.svg",
    "Brazil": "https://flagcdn.com/br.svg",
    "China": "https://flagcdn.com/cn.svg",
    "India": "https://flagcdn.com/in.svg",
  };
}
