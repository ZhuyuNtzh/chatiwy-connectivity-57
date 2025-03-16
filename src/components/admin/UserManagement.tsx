
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MoreHorizontal,
  Shield,
  Crown,
  User as UserIcon,
  Ban,
  Check,
  Clock,
  ChevronDown,
  UserX,
  Bot,
  UserCheck,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BannedUser, UserRole } from '@/types/user';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';

interface User {
  id: number;
  username: string;
  gender: string;
  age: number;
  location: string;
  interests: string[];
  isOnline: boolean;
  isVip?: boolean;
  isAdmin?: boolean;
  isBot?: boolean;
  isBanned?: boolean;
  email?: string;
  role?: UserRole;
}

interface UserManagementProps {
  users: User[];
  bannedUsers: BannedUser[];
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, bannedUsers, onClose }) => {
  const { addBannedUser, removeBannedUser, kickUser, setTempVipStatus, upgradeToVip } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isUserActionOpen, setIsUserActionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'vip' | 'kick' | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('24h');
  const [vipDuration, setVipDuration] = useState('30d');
  const [isPermanentVip, setIsPermanentVip] = useState(false);
  const [isConfirmVipDialogOpen, setIsConfirmVipDialogOpen] = useState(false);

  // Filter users based on search term and tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Specific filtering logic based on the selected tab
    if (selectedTab === 'all') {
      // For "All" tab, show only:
      // 1. Standard users who are online
      // 2. All VIP users regardless of online status
      // 3. Admin users
      if (user.role === 'admin') return matchesSearch;
      if (user.role === 'vip') return matchesSearch;
      return user.isOnline && matchesSearch; // Standard users must be online
    }
    else if (selectedTab === 'standard') return !user.isVip && !user.isAdmin && !user.isBot && user.isOnline && matchesSearch;
    else if (selectedTab === 'vip') return (user.isVip || user.role === 'vip') && matchesSearch;
    else if (selectedTab === 'admin') return (user.isAdmin || user.role === 'admin') && matchesSearch;
    else if (selectedTab === 'bots') return user.isBot && matchesSearch;
    
    return matchesSearch;
  });

  const handleUserAction = (user: User, action: 'ban' | 'vip' | 'kick') => {
    setSelectedUser(user);
    setActionType(action);
    setIsUserActionOpen(true);
    
    // Reset form states
    setBanReason('');
    setBanDuration('24h');
    setVipDuration('30d');
    setIsPermanentVip(false);
  };
  
  const calculateExpiryDate = (duration: string): Date => {
    const now = new Date();
    
    if (duration === '1h') return new Date(now.getTime() + 60 * 60 * 1000);
    if (duration === '24h') return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (duration === '48h') return new Date(now.getTime() + 48 * 60 * 60 * 1000);
    if (duration === '7d') return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (duration === '30d') return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Default to 24 hours
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  };

  const handleConfirmAction = () => {
    if (!selectedUser) return;
    
    switch(actionType) {
      case 'ban':
        const expiryDate = banDuration === 'permanent' ? undefined : calculateExpiryDate(banDuration);
        
        addBannedUser({
          username: selectedUser.username,
          userId: selectedUser.id,
          banReason: banReason || 'Violation of community guidelines',
          bannedAt: new Date(),
          banExpiresAt: expiryDate,
          bannedBy: 'admin',
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        });
        
        toast.success(`User ${selectedUser.username} has been banned`);
        break;
        
      case 'vip':
        // Open confirmation dialog instead of directly upgrading
        setIsConfirmVipDialogOpen(true);
        return;
        
      case 'kick':
        kickUser(selectedUser.id);
        toast.success(`User ${selectedUser.username} has been kicked from the chat`);
        break;
    }
    
    setIsUserActionOpen(false);
  };
  
  const handleConfirmVipUpgrade = () => {
    if (!selectedUser) return;
    
    if (isPermanentVip) {
      upgradeToVip(selectedUser.id, selectedUser.username, true);
      toast.success(`${selectedUser.username} has been permanently upgraded to VIP`);
    } else {
      const expiryDate = calculateExpiryDate(vipDuration);
      
      if (vipDuration === '30d' || vipDuration === '7d') {
        upgradeToVip(selectedUser.id, selectedUser.username, false, expiryDate);
      } else {
        setTempVipStatus(selectedUser.id, selectedUser.username, expiryDate);
      }
      
      toast.success(`${selectedUser.username} has been granted VIP status until ${expiryDate.toLocaleString()}`);
    }
    
    // Update the user's VIP status immediately in the local state
    users.forEach(user => {
      if (user.id === selectedUser.id) {
        user.isVip = true;
        user.role = 'vip';
      }
    });
    
    setIsConfirmVipDialogOpen(false);
    setIsUserActionOpen(false);
  };

  const handleRemoveBan = (userId: number) => {
    removeBannedUser(userId);
    toast.success('User has been unbanned');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="vip">VIP</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="bots">Bots</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="border rounded-md">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            {user.isBot ? (
                              <Bot className="h-4 w-4 text-blue-700" />
                            ) : (
                              <UserIcon className="h-4 w-4 text-blue-700" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isOnline ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Offline</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isAdmin || user.role === 'admin' ? (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Admin
                          </Badge>
                        ) : user.isVip || user.role === 'vip' ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                            <Crown className="h-3 w-3" /> VIP
                          </Badge>
                        ) : user.isBot ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
                            <Bot className="h-3 w-3" /> Bot
                          </Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!(user.isAdmin || user.role === 'admin') && !(user.isVip || user.role === 'vip') && (
                              <DropdownMenuItem onClick={() => handleUserAction(user, 'vip')}>
                                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Upgrade to VIP</span>
                              </DropdownMenuItem>
                            )}
                            {!(user.isAdmin || user.role === 'admin') && !user.isBot && (
                              <>
                                <DropdownMenuItem onClick={() => handleUserAction(user, 'ban')}>
                                  <Ban className="mr-2 h-4 w-4 text-red-500" />
                                  <span>Ban User</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUserAction(user, 'kick')}>
                                  <UserX className="mr-2 h-4 w-4 text-orange-500" />
                                  <span>Kick from Chat</span>
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
          </ScrollArea>
        </TabsContent>

        {/* Similar content for other tabs */}
        <TabsContent value="standard" className="border rounded-md">
          <ScrollArea className="h-[400px]">
            <Table>
              {/* ... Similar table structure as "all" tab */}
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No standard users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <UserIcon className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUserAction(user, 'vip')}>
                              <Crown className="mr-2 h-4 w-4 text-amber-500" />
                              <span>Upgrade to VIP</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user, 'ban')}>
                              <Ban className="mr-2 h-4 w-4 text-red-500" />
                              <span>Ban User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user, 'kick')}>
                              <UserX className="mr-2 h-4 w-4 text-orange-500" />
                              <span>Kick from Chat</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        {/* VIP Tab Content */}
        <TabsContent value="vip" className="border rounded-md">
          {/* Similar structure */}
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No VIP users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                            <Crown className="h-4 w-4 text-amber-700" />
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isOnline ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Offline</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUserAction(user, 'ban')}>
                              <Ban className="mr-2 h-4 w-4 text-red-500" />
                              <span>Ban User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user, 'kick')}>
                              <UserX className="mr-2 h-4 w-4 text-orange-500" />
                              <span>Kick from Chat</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        {/* Admin & Bots tab content - similar structure */}
        <TabsContent value="admin" className="border rounded-md">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No admin users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                            <Shield className="h-4 w-4 text-purple-700" />
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isOnline ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Offline</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="bots" className="border rounded-md">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No bots found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                            <Bot className="h-4 w-4 text-blue-700" />
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isOnline ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Online</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Offline</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.location}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="banned" className="pt-6">
        <TabsList>
          <TabsTrigger value="banned">Banned Users</TabsTrigger>
        </TabsList>
        <TabsContent value="banned" className="border rounded-md">
          <ScrollArea className="h-[200px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Ban Reason</TableHead>
                  <TableHead>Banned At</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No banned users</TableCell>
                  </TableRow>
                ) : (
                  bannedUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                            <UserX className="h-4 w-4 text-red-700" />
                          </div>
                          <div>{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.banReason || 'Violation of terms'}</TableCell>
                      <TableCell>{format(new Date(user.bannedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>
                        {user.banExpiresAt ? (
                          format(new Date(user.banExpiresAt), 'MMM dd, yyyy HH:mm')
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Permanent</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveBan(user.userId)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Unban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* User action dialogs */}
      <Dialog open={isUserActionOpen} onOpenChange={setIsUserActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'vip' && 'Upgrade to VIP'}
              {actionType === 'kick' && 'Kick User from Chat'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'ban' && 'Ban this user from accessing the platform'}
              {actionType === 'vip' && 'Upgrade this user to VIP status'}
              {actionType === 'kick' && 'Disconnect this user from the current chat session'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <UserIcon className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium">{selectedUser?.username}</h3>
                <p className="text-sm text-gray-500">{selectedUser?.email}</p>
              </div>
            </div>

            {actionType === 'ban' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ban-reason">Reason for ban</Label>
                  <Textarea 
                    id="ban-reason" 
                    placeholder="Enter the reason for banning this user"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ban-duration">Ban duration</Label>
                  <Select value={banDuration} onValueChange={setBanDuration}>
                    <SelectTrigger id="ban-duration">
                      <SelectValue placeholder="Select ban duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="48h">48 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {actionType === 'vip' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="vip-type">VIP status type</Label>
                  <Select 
                    value={isPermanentVip ? "permanent" : "temporary"} 
                    onValueChange={(value) => setIsPermanentVip(value === "permanent")}
                  >
                    <SelectTrigger id="vip-type">
                      <SelectValue placeholder="Select VIP type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temporary">Temporary VIP</SelectItem>
                      <SelectItem value="permanent">Permanent VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {!isPermanentVip && (
                  <div className="space-y-2">
                    <Label htmlFor="vip-duration">VIP duration</Label>
                    <Select value={vipDuration} onValueChange={setVipDuration}>
                      <SelectTrigger id="vip-duration">
                        <SelectValue placeholder="Select VIP duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="48h">48 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {actionType === 'kick' && (
              <p className="text-sm text-gray-500">
                This will disconnect the user from their current chat session. They will be able to log back in.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserActionOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmAction}>
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'vip' && 'Upgrade to VIP'}
              {actionType === 'kick' && 'Kick User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIP Confirmation Dialog */}
      <Dialog open={isConfirmVipDialogOpen} onOpenChange={setIsConfirmVipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm VIP Upgrade</DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade this user to VIP status?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-3 rounded-md border p-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium">Upgrade {selectedUser?.username} to VIP</p>
                <p className="text-sm text-gray-500">
                  {isPermanentVip 
                    ? 'This user will be granted permanent VIP status.' 
                    : `This user will have VIP status until ${calculateExpiryDate(vipDuration).toLocaleString()}`
                  }
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmVipDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmVipUpgrade}>Confirm Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
