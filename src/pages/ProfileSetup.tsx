import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '../components/Header';
import RulesModal from '../components/RulesModal';
import { useUser, UserProfile } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateUsername } from '@/utils/helpers';
import axios from 'axios';

interface Country {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
}

const interests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Fitness', 'Pets', 'Photography', 'Writing', 'Nature',
  'Cooking', 'Learning languages', 'Current events', 'Hobbies', 'Socializing'
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { userRole, setCurrentUser, setIsLoggedIn, setRulesAccepted, rulesAccepted } = useUser();
  const { isDarkMode } = useTheme();
  
  const [nickname, setNickname] = useState(generateUsername());
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [country, setCountry] = useState<Country | null>(null);
  
  const maxInterests = userRole === 'vip' ? 5 : 3;
  
  useEffect(() => {
    const getCountryFromIP = async () => {
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        const countryResponse = await axios.get(`https://ipapi.co/${ipResponse.data.ip}/json/`);
        const countryData = await axios.get(`https://restcountries.com/v3.1/alpha/${countryResponse.data.country_code}`);
        setCountry(countryData.data[0]);
        setLocation(countryData.data[0].name.common);
      } catch (error) {
        console.error('Error fetching country:', error);
        setCountry(null);
      }
    };

    if (userRole === 'standard') {
      getCountryFromIP();
    }
  }, [userRole]);
  
  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      if (selectedInterests.length < maxInterests) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    } else {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    }
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Create user profile
    const userProfile: UserProfile = {
      username: nickname,
      age: parseInt(age),
      gender,
      interests: selectedInterests,
      location,
      isOnline: true,
      lastActive: new Date(),
      role: userRole!,
      isVip: userRole === 'vip',
      isAdmin: userRole === 'admin',
      joinedAt: new Date(),
    };
    
    setCurrentUser(userProfile);
    setIsLoggedIn(true);
    
    // Navigate to chat interface and then show the rules modal
    navigate('/chat-interface');
    setIsRulesModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in-down">
            <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
            <p className="text-muted-foreground">
              {userRole === 'vip' 
                ? 'Set up your VIP profile to get started' 
                : 'Quick profile setup to get chatting'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#EDE8D0] to-[#EDE8D0]/90 rounded-lg p-6 animate-fade-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-gray-800">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  readOnly
                  className="glass-input bg-white/70 text-gray-800 placeholder:text-gray-500"
                  required
                />
                <p className="text-xs text-gray-600">
                  Your nickname cannot be changed after setup
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-800">Age</Label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger className="glass-input bg-white/70 text-gray-800">
                      <SelectValue placeholder="Select your age" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                        <SelectItem key={age} value={age.toString()}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-800">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="glass-input bg-white/70 text-gray-800">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {userRole === 'vip' && (
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-800">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="glass-input bg-white/70 text-gray-800 placeholder:text-gray-500"
                    placeholder="Enter your location"
                  />
                </div>
              )}
              
              {userRole === 'standard' && country && (
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-800">Location (Detected)</Label>
                  <div className="flex items-center space-x-2 bg-white/70 rounded-md px-3 py-2 border border-input">
                    <img 
                      src={country.flags.svg} 
                      alt={`${country.name.common} flag`} 
                      className="w-6 h-4 object-cover"
                    />
                    <span className="text-gray-800">{country.name.common}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Based on your IP address (Standard users cannot change)
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-gray-800">Interests (Select up to {maxInterests})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {interests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={selectedInterests.includes(interest)}
                        onCheckedChange={(checked) => 
                          handleInterestChange(interest, checked as boolean)
                        }
                        disabled={
                          !selectedInterests.includes(interest) && 
                          selectedInterests.length >= maxInterests
                        }
                        className="border-[#FB9E41] text-[#FB9E41] data-[state=checked]:bg-[#FB9E41] data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor={`interest-${interest}`}
                        className="text-sm font-medium leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Selected: {selectedInterests.length}/{maxInterests}
                </p>
              </div>
              
              <Button type="submit" className="w-full bg-[#FB9E41] hover:bg-[#FB9E41]/90 text-white">
                Start Chatting
              </Button>
            </div>
          </form>
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
