
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Ban
} from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mock user data for the admin dashboard
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

// Create some initial banned users
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

const AdminDashboard = () => {
  const { currentUser, userRole, bannedUsers, setBannedUsers } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showChatModeration, setShowChatModeration] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  
  // Initialize banned users if empty
  useEffect(() => {
    if (bannedUsers.length === 0) {
      setBannedUsers(initialBannedUsers);
    }
  }, [bannedUsers.length, setBannedUsers]);
  
  // Check if the user is an admin
  useEffect(() => {
    if (!currentUser || userRole !== 'admin') {
      navigate('/');
    }
  }, [currentUser, userRole, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            System administration and management portal
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => setShowUserManagement(true)}>
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
          
          <Card className="border-2 border-green-500/20 hover:border-green-500/50 transition-all cursor-pointer" onClick={() => setShowChatModeration(true)}>
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
          
          <Card className="border-2 border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer" onClick={() => setShowSystemSettings(true)}>
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
        
        <Card className="border-2 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Development Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The admin dashboard is currently under development. More features will be added soon.
              <br /><br />
              <strong>Admin Credentials:</strong><br />
              Username: admin or admin@chatwii.com<br />
              Password: admin123!
            </p>
          </CardContent>
        </Card>
      </main>

      {/* User Management Dialog */}
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

      {/* Chat Moderation Dialog - Placeholder for future implementation */}
      <Dialog open={showChatModeration} onOpenChange={setShowChatModeration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Moderation
            </DialogTitle>
            <DialogDescription>
              This feature is under development
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p>The chat moderation system is currently being developed. Check back soon!</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* System Settings Dialog - Placeholder for future implementation */}
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
    </div>
  );
};

export default AdminDashboard;
