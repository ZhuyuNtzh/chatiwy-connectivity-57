
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InterestsSelector from './InterestsSelector';
import CountryDisplay from './CountryDisplay';
import { UserProfile } from '@/contexts/UserContext';

interface ProfileFormProps {
  nickname: string;
  age: string;
  gender: string;
  setGender: (gender: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (interests: string[]) => void;
  country: any;
  location: string;
  setLocation: (location: string) => void;
  isLoading: boolean;
  userRole: string | null;
  setCurrentUser: (user: UserProfile) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setRulesAccepted: (accepted: boolean) => void;
}

const ProfileForm = ({
  nickname,
  age,
  gender,
  setGender,
  selectedInterests,
  setSelectedInterests,
  country,
  location,
  setLocation,
  isLoading,
  userRole,
  setCurrentUser,
  setIsLoggedIn,
  setRulesAccepted
}: ProfileFormProps) => {
  const navigate = useNavigate();
  const maxInterests = userRole === 'vip' ? 5 : 3;
  
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
    setRulesAccepted(false); // To ensure rules modal shows up
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#EDE8D0] to-[#EDE8D0]/90 rounded-lg p-4 animate-fade-in">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="nickname" className="text-gray-800">Nickname</Label>
          <Input
            id="nickname"
            value={nickname}
            readOnly
            className="glass-input bg-gray-100 text-gray-800 placeholder:text-gray-500"
            required
          />
        </div>

        <CountryDisplay 
          country={country}
          location={location}
          setLocation={setLocation}
          isLoading={isLoading}
          userRole={userRole}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="age" className="text-gray-800">Age</Label>
            <Select value={age} disabled>
              <SelectTrigger className="glass-input bg-white/70 text-gray-800">
                <SelectValue placeholder="Select your age" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 63 }, (_, i) => i + 18).map((ageOption) => (
                  <SelectItem key={ageOption} value={ageOption.toString()}>
                    {ageOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
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
        
        <InterestsSelector
          selectedInterests={selectedInterests}
          onChange={setSelectedInterests}
          maxInterests={maxInterests}
          userRole={userRole}
        />
        
        <Button type="submit" className="w-full bg-[#FB9E41] hover:bg-[#FB9E41]/90 text-white">
          Start Chatting
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
