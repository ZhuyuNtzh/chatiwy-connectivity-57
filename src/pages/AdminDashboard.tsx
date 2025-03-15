import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser, BannedUser } from '@/contexts/UserContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertCircle, 
  Users, 
  MessageSquare, 
  Settings, 
  Shield, 
  UserCheck,
  Crown,
  Bot,
  Ban,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  ChevronDown,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserManagement from '@/components/admin/UserManagement';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

const mockUsers = [
  { id: 1, username: "Alice", role: "standard", isOnline: true, location: "Canada", gender: "Female", age: 28, email: "alice@example.com", isBot: false, isBanned: false },
  { id: 2, username: "Bob", role: "standard", isOnline: true, location: "USA", gender: "Male", age: 32, email: "bob@example.com", isBot: false, isBanned: false },
  { id: 3, username: "Clara", role: "vip", isOnline: true, location: "France", gender: "Female", age: 25, email: "clara@example.com", isBot: false, isBanned: false },
  { id: 4, username: "David", role: "standard", isOnline: false, location: "UK", gender: "Male", age: 30, email: "david@example.com", isBot: false, isBanned: false },
  { id: 5, username: "Elena", role: "vip", isOnline: true, location: "Italy", gender: "Female", age: 27, email: "elena@example.com", isBot: false, isBanned: false },
  { id: 6, username: "Frank", role: "standard", isOnline: true, location: "Germany", gender: "Male", age: 35, email: "frank@example.com", isBot: false, isBanned: false },
  { id: 7, username: "Gina", role: "standard", isOnline: true, location: "Spain", gender: "Female", age: 29, email: "gina@example.com", isBot: false, isBanned: false },
  { id: 8, username: "Henry", role: "standard", isOnline: false, location: "Australia", gender: "Male", age: 31, email: "henry@example.com", isBot: false, isBanned: false },
  { id: 9, username: "Irene", role: "vip", isOnline: true, location: "Japan", gender: "Female", age: 26, email: "irene@example.com", isBot: false, isBanned: false },
  { id: 10, username: "Jack", role: "standard", isOnline: true, location: "Brazil", gender: "Male", age: 33, email: "jack@example.com", isBot: false, isBanned: false },
  { id: 11, username: "TravelBot", role: "standard", isOnline: true, location: "Global", gender: "Other", age: 1, email: "travel@bots.com", isBot: true, isBanned: false },
  { id: 12, username: "FitnessGuru", role: "standard", isOnline: true, location: "Global", gender: "Other", age: 1, email: "fitness@bots.com", isBot: true, isBanned: false },
  { id: 13, username: "BookWorm", role: "standard", isOnline: true, location: "Global", gender: "Other", age: 1, email: "books@bots.com", isBot: true, isBanned: false },
];

const initialBannedUsers: BannedUser[] = [
  { 
    username: "Spammer123", 
    userId: 101, 
    banReason: "Spamming advertisements", 
    bannedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    banExpiresAt: new Date(Date.now() + 86400000 * 5), // 5 days from now
    bannedBy: "admin",
    ipAddress: "192.168.1.100"
  },
  { 
    username: "ToxicUser", 
    userId: 102, 
    banReason: "Harassment and hate speech", 
    bannedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    banExpiresAt: undefined, // Permanent ban
    bannedBy: "admin",
    ipAddress: "192.168.1.101"
  }
];

const mockCountryFlags: Record<string, string> = {
  "USA": "https://flagcdn.com/w20/us.png",
  "UK": "https://flagcdn.com/w20/gb.png",
  "Canada": "https://flagcdn.com/w20/ca.png",
  "Australia": "https://flagcdn.com/w20/au.png",
  "France": "https://flagcdn.com/w20/fr.png",
  "Germany": "https://flagcdn.com/w20/de.png",
  "Italy": "https://flagcdn.com/w20/it.png",
  "Spain": "https://flagcdn.com/w20/es.png",
  "Japan": "https://flagcdn.com/w20/jp.png",
  "Brazil": "https://flagcdn.com/w20/br.png",
  "Mexico": "https://flagcdn.com/w20/mx.png",
  "China": "https://flagcdn.com/w20/cn.png",
  "India": "https://flagcdn.com/w20/in.png",
  "Russia": "https://flagcdn.com/w20/ru.png",
  "Global": "https://cdn-icons-png.flaticon.com/512/52/52349.png",
};

const AdminDashboard = () => {
  const { currentUser, userRole, bannedUsers, setBannedUsers, toggleAdminVisibility, adminSettings, setAdminSettings } = useUser();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    username: 'Admin',
    email: adminSettings.email || 'admin@chatwii.com',
    phoneNumber: adminSettings.phoneNumber || '',
    avatarUrl: adminSettings.avatarUrl || '',
  });
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (bannedUsers.length === 0) {
      setBannedUsers(initialBannedUsers);
    }
  }, [bannedUsers.length, setBannedUsers]);
  
  useEffect(() => {
    if (!currentUser || userRole !== 'admin') {
      navigate('/');
    }
  }, [currentUser, userRole, navigate]);
  
  const handleToggleVisibility = () => {
    toggleAdminVisibility();
    toast.success(`Admin visibility ${adminSettings.isVisible ? 'disabled' : 'enabled'}`);
  };
  
  const handleUserClick = (user: any) => {
    setSelectedUser(user);
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
  };
  
  const handleSaveAdminSettings = () => {
    setAdminSettings({
      ...adminSettings,
      email: adminProfile.email,
      phoneNumber: adminProfile.phoneNumber,
      avatarUrl: adminProfile.avatarUrl,
    });
    toast.success('Admin profile updated successfully');
    setShowAdminSettings(false);
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAdminProfile({
            ...adminProfile,
            avatarUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleChatModerationClick = () => {
    navigate('/admin-moderation');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 border-b pb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-500" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                System administration and management portal
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVisibility}
              className="gap-1"
            >
              {adminSettings.isVisible ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Invisible</span>
                </>
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-1">
                      <AvatarImage src={adminProfile.avatarUrl} />
                      <AvatarFallback className="bg-purple-100 text-purple-800">AD</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>Admin</span>
                    <span className="text-xs font-normal text-muted-foreground">{adminProfile.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowAdminSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setShowSidebar(!showSidebar)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Chat with Users</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card 
            className="border-2 border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer" 
            onClick={() => setShowUserManagement(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View, edit, suspend or verify user accounts. Manage user roles and permissions.
              </p>
              <Button className="w-full" variant="outline">
                Open User Management
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            className="border-2 border-green-500/20 hover:border-green-500/50 transition-all cursor-pointer" 
            onClick={handleChatModerationClick}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Chat Moderation
              </CardTitle>
              <CardDescription>Monitor and moderate conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review reported messages, monitor suspicious activity, and enforce community guidelines.
              </p>
              <Button className="w-full" variant="outline">
                Open Chat Moderation
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            className="border-2 border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer" 
            onClick={() => setShowSystemSettings(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                System Settings
              </CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure system settings, manage global rules, and customize application behavior.
              </p>
              <Button className="w-full" variant="outline">
                Open System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                VIP Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Total VIP Users</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    {mockUsers.filter(u => u.role === 'vip').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">VIP Users Online</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {mockUsers.filter(u => u.role === 'vip' && u.isOnline).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">VIP Conversion Rate</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {((mockUsers.filter(u => u.role === 'vip').length / mockUsers.filter(u => !u.isBot).length) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-red-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-500" />
                Banned Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Total Banned Users</span>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    {bannedUsers.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm text-muted-foreground">Permanent Bans</span>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    {bannedUsers.filter(u => !u.banExpiresAt).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Temporary Bans</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    {bannedUsers.filter(u => u.banExpiresAt).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </DialogTitle>
            <DialogDescription>
              Manage all user accounts, roles, and permissions
            </DialogDescription>
          </DialogHeader>
          <UserManagement 
            users={mockUsers} 
            bannedUsers={bannedUsers} 
            onClose={() => setShowUserManagement(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showSystemSettings} onOpenChange={setShowSystemSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </DialogTitle>
            <DialogDescription>
              This feature is under development
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p>The system settings module is currently being developed. Check back soon!</p>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAdminSettings} onOpenChange={setShowAdminSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Profile Settings
            </DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 mx-auto cursor-pointer" onClick={() => fileInputRef?.click()}>
                  <AvatarImage src={adminProfile.avatarUrl} />
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">AD</AvatarFallback>
                </Avatar>
                <Badge 
                  className="absolute bottom-0 right-0 cursor-pointer hover:bg-primary/90" 
                  onClick={() => fileInputRef?.click()}
                >
                  Change
                </Badge>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  ref={(ref) => setFileInputRef(ref)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input 
                id="admin-username" 
                value={adminProfile.username}
                onChange={(e) => setAdminProfile({...adminProfile, username: e.target.value})}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input 
                id="admin-email" 
                type="email"
                value={adminProfile.email}
                onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-phone">Phone Number (Optional)</Label>
              <Input 
                id="admin-phone" 
                type="tel"
                value={adminProfile.phoneNumber}
                onChange={(e) => setAdminProfile({...adminProfile, phoneNumber: e.target.value})}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowAdminSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdminSettings}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6 md:p-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] shadow-xl overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    Admin Chat
                  </span>
                  <Badge variant="admin">Admin</Badge>
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCloseChat}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <ChatWindow 
                  user={selectedUser} 
                  countryFlags={mockCountryFlags} 
                  onClose={handleCloseChat} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
