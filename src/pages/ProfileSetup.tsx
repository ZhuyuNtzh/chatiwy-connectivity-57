
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Moon, Sun } from 'lucide-react';
import Header from '../components/Header';
import RulesModal from '../components/RulesModal';
import { useUser, UserProfile } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { generateUsername } from '@/utils/helpers';

const interests = [
  'Gaming', 'Music', 'Movies', 'Books', 'Travel',
  'Food', 'Sports', 'Technology', 'Art', 'Fashion',
  'Fitness', 'Pets', 'Photography', 'Writing', 'Nature',
  'Cooking', 'Learning languages', 'Current events', 'Hobbies', 'Socializing'
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { userRole, setCurrentUser, setIsLoggedIn, setRulesAccepted, rulesAccepted } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [nickname, setNickname] = useState(generateUsername());
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  
  const maxInterests = userRole === 'vip' ? 5 : 3;
  
  useEffect(() => {
    // Simulate location detection for standard users
    if (userRole === 'standard') {
      setLocation('United States');
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
    
    // Navigate to user list/chat screen and then show the rules modal
    navigate('/user-list');
    setIsRulesModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="mt-2 hover:bg-accent/10"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="glass-card p-6 animate-fade-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  readOnly
                  className="glass-input bg-muted/30"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your nickname cannot be changed after setup
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger className="glass-input">
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
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="glass-input">
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="glass-input"
                    placeholder="Enter your location"
                  />
                </div>
              )}
              
              {userRole === 'standard' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Detected)</Label>
                  <Input
                    id="location"
                    value={location}
                    readOnly
                    className="glass-input bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Based on your IP address (Standard users cannot change)
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Interests (Select up to {maxInterests})</Label>
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
                      />
                      <label
                        htmlFor={`interest-${interest}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedInterests.length}/{maxInterests}
                </p>
              </div>
              
              <Button type="submit" className="w-full">
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
