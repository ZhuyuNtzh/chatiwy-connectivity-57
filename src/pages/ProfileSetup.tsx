
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
        // Use more reliable API endpoints with fallbacks
        try {
          const ipResponse = await axios.get('https://api.ipify.org?format=json');
          const countryResponse = await axios.get(`https://ipapi.co/${ipResponse.data.ip}/json/`);
          
          if (countryResponse.data && countryResponse.data.country_code) {
            const countryData = await axios.get(`https://restcountries.com/v3.1/alpha/${countryResponse.data.country_code}`);
            setCountry(countryData.data[0]);
            setLocation(countryData.data[0].name.common);
          } else {
            throw new Error("Could not get country data");
          }
        } catch (error) {
          // Fallback to a default country
          console.error('Error with initial country detection:', error);
          const defaultCountry = await axios.get(`https://restcountries.com/v3.1/name/united%20states`);
          setCountry(defaultCountry.data[0]);
          setLocation(defaultCountry.data[0].name.common);
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        setCountry(null);
        // Set a default location if everything fails
        setLocation("United States");
        toast.error("Could not detect your country automatically");
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
