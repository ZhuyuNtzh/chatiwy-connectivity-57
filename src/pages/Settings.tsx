
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Crown, X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import AvatarSelectPopup from '@/components/vip/profile/AvatarSelectPopup';
import ChangeEmailDialog from '@/components/vip/profile/ChangeEmailDialog';
import DeleteAccountDialog from '@/components/vip/profile/DeleteAccountDialog';
import axios from 'axios';

const Settings = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, setIsLoggedIn } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(currentUser?.avatar);
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [age, setAge] = useState(currentUser?.age?.toString() || '');
  const [gender, setGender] = useState(currentUser?.gender || '');
  const [country, setCountry] = useState(currentUser?.location || 'United States');
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  const [isOnline, setIsOnline] = useState(currentUser?.isOnline !== false);
  const [newInterest, setNewInterest] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const membershipStartDate = new Date(currentUser?.joinedAt || Date.now());
  const membershipEndDate = new Date(membershipStartDate);
  membershipEndDate.setFullYear(membershipEndDate.getFullYear() + 1);

  const ageOptions = Array.from({ length: 63 }, (_, i) => String(18 + i));

  useEffect(() => {
    if (!currentUser || !currentUser.isVip) {
      navigate('/login');
    }
    
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
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
        setIsLoadingCountries(false);
      }
    };
    
    fetchCountries();
  }, [currentUser, navigate]);

  const handleSave = () => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        avatar,
        age: parseInt(age),
        gender,
        location: country,
        interests,
        isOnline
      };
      setCurrentUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setAvatar(currentUser?.avatar);
    setUsername(currentUser?.username || '');
    setEmail(currentUser?.email || '');
    setAge(currentUser?.age?.toString() || '');
    setGender(currentUser?.gender || '');
    setCountry(currentUser?.location || 'United States');
    setInterests(currentUser?.interests || []);
    setIsOnline(currentUser?.isOnline !== false);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const handleAddInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleStartChatting = () => {
    sessionStorage.setItem('allowVIPChatAccess', 'true');
    navigate('/chat-interface');
  };

  const handleAvatarSelect = (avatarSrc: string) => {
    setAvatar(avatarSrc);
    
    if (!isEditing && currentUser) {
      const updatedUser = {
        ...currentUser,
        avatar: avatarSrc
      };
      setCurrentUser(updatedUser);
    }
  };

  const handleOnlineStatusChange = (status: boolean) => {
    setIsOnline(status);
    
    if (!isEditing && currentUser) {
      const updatedUser = {
        ...currentUser,
        isOnline: status
      };
      setCurrentUser(updatedUser);
      
      toast({
        title: status ? "You are now online" : "You are now offline",
        description: status ? "Other users can see you" : "You're now invisible to other users",
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-gray-50`}>
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="my-details" className="w-full">
          <TabsList className="mb-6 border-b-2 border-gray-200 w-full flex space-x-6 bg-transparent p-0">
            <TabsTrigger 
              value="my-details" 
              className="py-2 px-0 font-medium text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              My details
            </TabsTrigger>
            <TabsTrigger 
              value="membership" 
              className="py-2 px-0 font-medium text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              Membership
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="py-2 px-0 font-medium text-gray-600 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent"
            >
              Password
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-details" className="mt-0">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Personal info</h2>
                    <p className="text-gray-500 text-sm">Update your avatar and personal details here.</p>
                  </div>
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="bg-orange-400 hover:bg-orange-500"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-6 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label>Your Avatar</Label>
                    <p className="text-sm text-gray-500">This will be displayed on your profile.</p>
                    <div className="flex items-start mt-2">
                      <Avatar className="h-24 w-24 rounded-full border-4 border-gray-100">
                        {avatar ? (
                          <AvatarImage src={avatar} alt="Avatar" />
                        ) : (
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            <User size={40} />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAvatarPopup(true)}
                        >
                          Change Avatar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={true}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <div className="flex max-w-md">
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={true}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        className="ml-2 bg-orange-400 text-white hover:bg-orange-500"
                        onClick={() => setShowChangeEmailDialog(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="age">Age</Label>
                      <Select 
                        disabled={!isEditing} 
                        value={age} 
                        onValueChange={setAge}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your age" />
                        </SelectTrigger>
                        <SelectContent>
                          {ageOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select 
                        disabled={!isEditing} 
                        value={gender} 
                        onValueChange={setGender}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      disabled={!isEditing || isLoadingCountries} 
                      value={country} 
                      onValueChange={setCountry}
                    >
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder={isLoadingCountries ? "Loading countries..." : "Select your country"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {countries.map((country) => (
                          <SelectItem key={country.cca2} value={country.name.common}>
                            <div className="flex items-center gap-2">
                              <img 
                                src={country.flags.svg} 
                                alt={`${country.name.common} flag`} 
                                className="w-5 h-3 object-cover"
                              />
                              {country.name.common}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Online Status</Label>
                      <Switch 
                        checked={isOnline} 
                        onCheckedChange={handleOnlineStatusChange} 
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {isOnline ? "You are visible to other users" : "You are invisible to other users"}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Interest</Label>
                    <p className="text-sm text-gray-500">You can add new interests or remove old ones</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <div 
                          key={interest} 
                          className="flex items-center bg-orange-100 text-orange-800 rounded-full px-3 py-1"
                        >
                          <span>{interest}</span>
                          {isEditing && (
                            <button 
                              onClick={() => handleRemoveInterest(interest)}
                              className="ml-1 text-orange-800 hover:text-orange-900"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {isEditing && (
                        <div className="flex items-center gap-2">
                          <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="Add interest"
                            className="w-40 h-8"
                          />
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={handleAddInterest}
                            disabled={!newInterest}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="mb-4 sm:mb-0 bg-red-500 hover:bg-red-600"
                  >
                    Delete Account
                  </Button>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleStartChatting}
                      className="w-full bg-orange-400 hover:bg-orange-500"
                    >
                      Start Chatting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="membership">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">VIP Membership</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-200 to-amber-400 text-amber-800">
                    <Crown className="h-4 w-4 mr-1" />
                    Active
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="text-lg font-medium">
                      {membershipStartDate.toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="text-lg font-medium">
                      {membershipEndDate.toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">VIP Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Send unlimited photos
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Send voice messages
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Longer chat history
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Customer Support
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Unique avatar options
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Appear at the top of the list
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Ad-free
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      React, reply, edit, unsend messages
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      View message status
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Special Badges
                    </li>
                    <li className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      Control your online status
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={handleStartChatting}
                    className="w-full bg-orange-400 hover:bg-orange-500"
                  >
                    Start Chatting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button type="submit" className="mt-2">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t border-gray-100 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center md:justify-end items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-700">Terms & Privacy Policy</a>
          <a href="#" className="hover:text-gray-700">Contact us</a>
          <a href="#" className="hover:text-gray-700">FAQ</a>
        </div>
      </footer>
      
      <AvatarSelectPopup
        open={showAvatarPopup}
        onOpenChange={setShowAvatarPopup}
        currentAvatar={avatar || ''}
        onAvatarSelect={handleAvatarSelect}
      />
      
      <ChangeEmailDialog
        open={showChangeEmailDialog}
        onOpenChange={setShowChangeEmailDialog}
        currentEmail={email}
      />
      
      <DeleteAccountDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </div>
  );
};

export default Settings;
