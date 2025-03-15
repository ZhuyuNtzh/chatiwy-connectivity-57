
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import RulesModal from '../components/RulesModal';
import ProfileForm from '@/components/profile/ProfileForm';
import axios from 'axios';

interface Country {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
}

const ProfileSetup = () => {
  const { userRole, setCurrentUser, setIsLoggedIn, setRulesAccepted, rulesAccepted } = useUser();
  const { isDarkMode } = useTheme();
  
  // Don't generate a random nickname, leave it empty to force user input
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const getCountryFromIP = async () => {
      setIsLoading(true);
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        const countryResponse = await axios.get(`https://ipapi.co/${ipResponse.data.ip}/json/`);
        const countryData = await axios.get(`https://restcountries.com/v3.1/alpha/${countryResponse.data.country_code}`);
        setCountry(countryData.data[0]);
        setLocation(countryData.data[0].name.common);
      } catch (error) {
        console.error('Error fetching country:', error);
        setCountry(null);
      } finally {
        setIsLoading(false);
      }
    };

    getCountryFromIP();
  }, [userRole]);

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
