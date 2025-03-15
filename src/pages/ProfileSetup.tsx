
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import RulesModal from '../components/RulesModal';
import ProfileForm from '@/components/profile/ProfileForm';
import axios from 'axios';
import { toast } from 'sonner';

interface Country {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
}

const ProfileSetup = () => {
  const { userRole, setCurrentUser, setIsLoggedIn, setRulesAccepted, rulesAccepted, currentUser } = useUser();
  const { isDarkMode } = useTheme();
  
  // Use the nickname from currentUser if available
  const [nickname, setNickname] = useState(currentUser?.username || '');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Update nickname if currentUser changes
    if (currentUser?.username && !nickname) {
      setNickname(currentUser.username);
    }
    
    const getCountryFromIP = async () => {
      setIsLoading(true);
      try {
        // Use more reliable IP geolocation services with multiple fallbacks
        try {
          // First attempt: use ipify to get IP and then ipapi to get location
          const ipResponse = await axios.get('https://api.ipify.org?format=json');
          const ip = ipResponse.data.ip;
          console.log('Detected IP:', ip);
          
          // Use ipapi.co for geolocation (more accurate)
          const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
          console.log('Geolocation data:', geoResponse.data);
          
          if (geoResponse.data && geoResponse.data.country_name) {
            // Get country details from restcountries API
            const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${geoResponse.data.country_name}`);
            if (countryResponse.data && countryResponse.data.length > 0) {
              setCountry(countryResponse.data[0]);
              setLocation(countryResponse.data[0].name.common);
              console.log('Country set to:', countryResponse.data[0].name.common);
            } else {
              throw new Error("Country not found in restcountries API");
            }
          } else {
            throw new Error("Could not get country data from ipapi");
          }
        } catch (error) {
          console.error('First geolocation attempt failed:', error);
          
          // Second attempt: try with ip-api.com
          try {
            const geoResponse2 = await axios.get('http://ip-api.com/json/');
            console.log('Backup geolocation data:', geoResponse2.data);
            
            if (geoResponse2.data && geoResponse2.data.country) {
              const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${geoResponse2.data.country}`);
              if (countryResponse.data && countryResponse.data.length > 0) {
                setCountry(countryResponse.data[0]);
                setLocation(countryResponse.data[0].name.common);
                console.log('Country set to (backup):', countryResponse.data[0].name.common);
              } else {
                throw new Error("Country not found in restcountries API");
              }
            } else {
              throw new Error("Could not get country data from ip-api");
            }
          } catch (error) {
            console.error('Second geolocation attempt failed:', error);
            throw error; // Let the final fallback handle it
          }
        }
      } catch (error) {
        console.error('All geolocation attempts failed:', error);
        
        // Final fallback: Set a reasonable default country
        try {
          const defaultCountry = await axios.get(`https://restcountries.com/v3.1/name/united%20states`);
          setCountry(defaultCountry.data[0]);
          setLocation(defaultCountry.data[0].name.common);
          toast.error("Could not detect your country automatically. Using default.");
        } catch (finalError) {
          console.error('Final fallback failed:', finalError);
          setCountry(null);
          setLocation("United States");
          toast.error("Country detection failed completely");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getCountryFromIP();
  }, [userRole, currentUser, nickname]);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          <ProfileForm
            nickname={nickname}
            age={age}
            gender={gender}
            setGender={setGender}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            country={country}
            location={location}
            setLocation={setLocation}
            isLoading={isLoading}
            userRole={userRole}
            setCurrentUser={setCurrentUser}
            setIsLoggedIn={setIsLoggedIn}
            setRulesAccepted={setRulesAccepted}
            setNickname={setNickname}
          />
        </div>
      </main>
      
      <RulesModal 
        open={isRulesModalOpen} 
        onOpenChange={setIsRulesModalOpen} 
      />
    </div>
  );
};

export default ProfileSetup;
