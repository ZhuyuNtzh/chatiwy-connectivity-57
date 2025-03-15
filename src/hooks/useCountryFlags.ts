
import { useState, useEffect } from 'react';
import axios from 'axios';

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

    const detectUserCountry = async () => {
      // Try multiple geolocation services with fallbacks
      try {
        // First attempt with ipinfo.io
        const response = await axios.get('https://ipinfo.io/json');
        console.log('Detected country with ipinfo.io:', response.data.country);
        return response.data.country; // Returns country code
      } catch (error) {
        console.error('First geolocation attempt failed:', error);
        
        // Second attempt with ip-api
        try {
          const response = await axios.get('https://api.ipify.org?format=json');
          const ip = response.data.ip;
          const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
          console.log('Detected country with ipapi.co:', geoResponse.data.country_name);
          return geoResponse.data.country_name;
        } catch (error) {
          console.error('Second geolocation attempt failed:', error);
          
          // Third attempt with another service
          try {
            const response = await axios.get('https://geolocation-db.com/json/');
            console.log('Detected country with geolocation-db:', response.data.country_name);
            return response.data.country_name;
          } catch (error) {
            console.error('All geolocation attempts failed:', error);
            return null;
          }
        }
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
