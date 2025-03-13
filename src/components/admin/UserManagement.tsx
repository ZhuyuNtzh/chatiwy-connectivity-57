
import { useState } from 'react';
import { useUser, BannedUser } from '@/contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Crown, 
  UserCheck, 
  Bot, 
  Ban, 
  MoreVertical, 
  UserX, 
  AlertCircle, 
  Star,
  Mail,
  CheckCircle
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types for the user data
interface User {
  id: number;
  username: string;
  role: string;
  isOnline: boolean;
  location: string;
  gender: string;
  age: number;
  email: string;
  isBot: boolean;
  isBanned: boolean;
}

interface UserManagementProps {
  users: User[];
  bannedUsers: BannedUser[];
  onClose: () => void;
}

const UserManagement = ({ users, bannedUsers, onClose }: UserManagementProps) => {
  const { addBannedUser, removeBannedUser } = useUser();
  const [activeTab, setActiveTab] = useState("all-users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isKickDialogOpen, setIsKickDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [selectedBanDuration, setSelectedBanDuration] = useState("1");
  const [selectedBannedUser, setSelectedBannedUser] = useState<BannedUser | null>(null);
  const [isVipEmailSent, setIsVipEmailSent] = useState(false);

  // Different user categories
  const allUsers = users;
  const vipUsers = users.filter(user => user.role === 'vip');
  const standardUsers = users.filter(user => user.role === 'standard' && !user.isBot);
  const botUsers = users.filter(user => user.isBot);

  // Sort users by country, then by username
  const sortedAllUsers = [...allUsers].sort((a, b) => {
    // First sort by role (VIP first)
    if (a.role === 'vip' && b.role !== 'vip') return -1;
    if (a.role !== 'vip' && b.role === 'vip') return 1;
    
    // Then sort by country
    const countryCompare = a.location.localeCompare(b.location);
    if (countryCompare !== 0) return countryCompare;
    
    // Finally sort by username
    return a.username.localeCompare(b.username);
  });

  const sortedStandardUsers = [...standardUsers].sort((a, b) => {
    const countryCompare = a.location.localeCompare(b.location);
    if (countryCompare !== 0) return countryCompare;
    return a.username.localeCompare(b.username);
  });

  // User actions
  const handleKickUser = (user: User) => {
    setSelectedUser(user);
    setIsKickDialogOpen(true);
  };

  const confirmKickUser = () => {
    if (selectedUser) {
      toast.success(`${selectedUser.username} has been kicked from the chat.`);
      setIsKickDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const confirmBanUser = () => {
    if (selectedUser) {
      const days = parseInt(selectedBanDuration);
      const banExpiresAt = days < 7 ? new Date(Date.now() + days * 86400000) : undefined;
      
      const bannedUser: BannedUser = {
        username: selectedUser.username,
        userId: selectedUser.id,
        banReason: "Administrative action",
        bannedAt: new Date(),
        banExpiresAt: banExpiresAt,
        bannedBy: "admin",
        ipAddress: "127.0.0.1" // Placeholder IP address
      };
      
      addBannedUser(bannedUser);
      toast.success(`${selectedUser.username} has been banned for ${days < 7 ? days + ' days' : 'permanently'}.`);
      setIsBanDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUpgradeToVip = (user: User) => {
    setSelectedUser(user);
    setIsVipDialogOpen(true);
  };

  const handleTempVip = () => {
    if (selectedUser) {
      toast.success(`${selectedUser.username} has been given temporary VIP status for this session.`);
      setIsVipDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSendVipEmail = () => {
    if (selectedUser) {
      setIsVipEmailSent(true);
      toast.success(`VIP offer email sent to ${selectedUser.email}.`);
      // In a real implementation, we would send an actual email here
      setTimeout(() => {
        setIsVipEmailSent(false);
        setIsVipDialogOpen(false);
        setSelectedUser(null);
      }, 2000);
    }
  };

  const handleUnbanUser = (bannedUser: BannedUser) => {
    setSelectedBannedUser(bannedUser);
    setIsUnbanDialogOpen(true);
  };

  const confirmUnbanUser = () => {
    if (selectedBannedUser) {
      removeBannedUser(selectedBannedUser.userId);
      toast.success(`${selectedBannedUser.username} has been unbanned.`);
      setIsUnbanDialogOpen(false);
      setSelectedBannedUser(null);
    }
  };

  // Render user tables for each category
  const renderUserTable = (userList: User[], showVipUpgrade = false) => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  {user.isOnline ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500">
                      Offline
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.role === 'vip' ? (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">
                      VIP
                    </Badge>
                  ) : user.isBot ? (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
                      Bot
                    </Badge>
                  ) : (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => handleKickUser(user)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Kick User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBanUser(user)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
                      {showVipUpgrade && user.role === 'standard' && !user.isBot && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleUpgradeToVip(user)}>
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to VIP
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderBannedUsersTable = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Banned At</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Banned By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bannedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No banned users found
              </TableCell>
            </TableRow>
          ) : (
            bannedUsers.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{new Date(user.bannedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {user.banExpiresAt ? new Date(user.banExpiresAt).toLocaleDateString() : 'Permanent'}
                </TableCell>
                <TableCell>{user.banReason || 'N/A'}</TableCell>
                <TableCell>{user.bannedBy}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleUnbanUser(user)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Unban
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Main component render
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all-users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">All Users</span>
          </TabsTrigger>
          <TabsTrigger value="vip-users" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">VIP Users</span>
          </TabsTrigger>
          <TabsTrigger value="standard-users" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Standard Users</span>
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Bots</span>
          </TabsTrigger>
          <TabsTrigger value="banned-users" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">Banned Users</span>
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="all-users" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({sortedAllUsers.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            List of all users on the platform, ordered by role (VIP first), country, and username.
          </p>
          {renderUserTable(sortedAllUsers, true)}
        </TabsContent>
      
        <TabsContent value="vip-users" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            VIP Users ({vipUsers.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Users with VIP status who have premium access to the platform.
          </p>
          {renderUserTable(vipUsers)}
        </TabsContent>
      
        <TabsContent value="standard-users" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Standard Users ({standardUsers.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Standard users with basic access, ordered by country and username.
          </p>
          {renderUserTable(sortedStandardUsers, true)}
        </TabsContent>
      
        <TabsContent value="bots" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Bots ({botUsers.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Bot users that enhance the user experience on the platform.
          </p>
          {renderUserTable(botUsers)}
        </TabsContent>
      
        <TabsContent value="banned-users" className="space-y-4 pt-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Banned Users ({bannedUsers.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Users who have been banned from the platform.
          </p>
          {renderBannedUsersTable()}
        </TabsContent>
      </Tabs>

      {/* Kick Confirmation Dialog */}
      <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Kick User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to kick {selectedUser?.username}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKickDialogOpen(false)}>
              No, Cancel
            </Button>
            <Button variant="destructive" onClick={confirmKickUser}>
              Yes, Kick User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              Select the duration for banning {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="space-y-1">
              <label htmlFor="ban-duration" className="text-sm font-medium">
                Ban Duration:
              </label>
              <Select value={selectedBanDuration} onValueChange={setSelectedBanDuration}>
                <SelectTrigger id="ban-duration">
                  <SelectValue placeholder="Select ban duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="4">4 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="6">6 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="999">Permanent ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIP Upgrade Dialog */}
      <Dialog open={isVipDialogOpen} onOpenChange={setIsVipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade to VIP
            </DialogTitle>
            <DialogDescription>
              Choose how to upgrade {selectedUser?.username} to VIP status
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button 
              className="w-full flex justify-start items-center gap-3 h-auto py-3"
              variant="outline"
              onClick={handleTempVip}
            >
              <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
                <Star className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Temporary VIP</div>
                <div className="text-sm text-muted-foreground">
                  Grant VIP status for the current session only
                </div>
              </div>
            </Button>
            
            <Button 
              className="w-full flex justify-start items-center gap-3 h-auto py-3"
              variant="outline"
              onClick={handleSendVipEmail}
              disabled={isVipEmailSent}
            >
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Send VIP Gift</div>
                <div className="text-sm text-muted-foreground">
                  Send a monthly VIP gift offer via email
                </div>
              </div>
              {isVipEmailSent && (
                <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVipDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Confirmation Dialog */}
      <Dialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Unban User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {selectedBannedUser?.username}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnbanDialogOpen(false)}>
              No, Cancel
            </Button>
            <Button variant="default" onClick={confirmUnbanUser}>
              Yes, Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
