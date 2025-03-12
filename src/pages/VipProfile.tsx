
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, MessageSquare, UserCircle } from 'lucide-react';
import NicknameInput from '@/components/profile/NicknameInput';
import GenderSelector from '@/components/vip/profile/GenderSelector';
import AgeSelector from '@/components/vip/profile/AgeSelector';
import CountrySelector from '@/components/vip/profile/CountrySelector';
import InterestsSelector from '@/components/vip/profile/InterestsSelector';
import AvatarSelector from '@/components/vip/profile/AvatarSelector';
import axios from 'axios';

const VipProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { currentUser, setCurrentUser, setIsLoggedIn, userRole } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [nickname, setNickname] = useState(currentUser?.username || '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  const [age, setAge] = useState(currentUser?.age?.toString() || '25');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser?.interests || []);
  const [country, setCountry] = useState(currentUser?.location || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  
  useEffect(() => {
    // Redirect if not logged in or not a VIP user
    if (!currentUser || userRole !== 'vip') {
      navigate('/login');
      return;
    }
    
    // Fetch countries list for the selector
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
        const sortedCountries = response.data.sort((a: any, b: any) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          title: "Error",
          description: "Failed to load countries list",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCountries();
    
    // Set initial values from user profile
    if (currentUser) {
      setNickname(currentUser.username || '');
      setGender(currentUser.gender || '');
      setAge(currentUser.age?.toString() || '25');
      setSelectedInterests(currentUser.interests || []);
      setCountry(currentUser.location || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser, navigate, userRole]);
  
  const handleSaveChanges = () => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      gender,
      age: parseInt(age),
      interests: selectedInterests,
      location: country,
      avatar
    };
    
    setCurrentUser(updatedUser);
    setIsEditing(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleDeleteAccount = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    toast({
      title: "Account deleted",
      description: "Your account has been deleted successfully",
    });
    
    navigate('/');
  };
  
  const handleStartChatting = () => {
    navigate('/chat-interface');
  };
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f2f7f9]'}`}>
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">VIP Profile</CardTitle>
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button 
                onClick={handleSaveChanges} 
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                Save Changes
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt="Profile Avatar" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <AvatarSelector
                      selectedAvatar={avatar}
                      onSelect={setAvatar}
                    />
                  )}
                  
                  <NicknameInput 
                    nickname={nickname}
                    onChange={() => {}} // Read-only in profile
                    isVip={true}
                    readOnly={true}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-2/3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isEditing ? (
                    <>
                      <GenderSelector 
                        value={gender}
                        onChange={setGender}
                      />
                      
                      <AgeSelector 
                        age={age}
                        onChange={setAge}
                      />
                      
                      <div className="md:col-span-2">
                        <CountrySelector
                          country={country}
                          onChange={setCountry}
                          countries={countries}
                          isLoading={isLoading}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Gender</h3>
                        <p className="p-2 border rounded-md">{gender || 'Not specified'}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Age</h3>
                        <p className="p-2 border rounded-md">{age || 'Not specified'}</p>
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <h3 className="text-sm font-medium">Location</h3>
                        <p className="p-2 border rounded-md">{country || 'Not specified'}</p>
                      </div>
                    </>
                  )}
                  
                  <div className="md:col-span-2 space-y-2">
                    <h3 className="text-sm font-medium">Interests</h3>
                    {isEditing ? (
                      <InterestsSelector
                        selectedInterests={selectedInterests}
                        onChange={setSelectedInterests}
                        maxInterests={5}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedInterests.length > 0 ? (
                          selectedInterests.map((interest, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No interests selected</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              onClick={handleStartChatting}
              className="w-full sm:w-auto flex items-center gap-2 bg-primary"
            >
              <MessageSquare className="h-4 w-4" />
              Start Chatting
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full sm:w-auto flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete your account? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default VipProfile;
