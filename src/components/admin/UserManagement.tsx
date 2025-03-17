
import { useState, useMemo, useRef } from 'react';
import { BannedUser } from '@/contexts/UserContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  MoreVertical, 
  Ban, 
  UserCheck, 
  Shield, 
  Crown, 
  CircleOff, 
  Clock,
  Check,
  Search,
  UserX,
  BotIcon,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { useVipFeatures } from '@/hooks/useVipFeatures';
import VipFeatures from '@/components/chat/VipFeatures';
import { useForm } from 'react-hook-form';

interface UserManagementProps {
  users: any[];
  bannedUsers: BannedUser[];
  onClose: () => void;
  onAddBot?: (bot: any) => void;
}

const UserManagement = ({ users, bannedUsers, onClose, onAddBot }: UserManagementProps) => {
  const { addBannedUser, removeBannedUser, kickUser } = useUser();
  const { 
    setTempVipStatus, 
    upgradeToVip, 
    vipUpgradeUser, 
    isVipUpgradeDialogOpen, 
    setIsVipUpgradeDialogOpen,
    confirmTempVipStatus 
  } = useVipFeatures();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('standard');
  const [isAddBotDialogOpen, setIsAddBotDialogOpen] = useState(false);
  const [newBot, setNewBot] = useState({
    username: '',
    location: 'Global',
    gender: 'Other',
    age: 1,
    email: '',
  });
  const nextBotId = useRef(Math.max(...users.map(u => u.id)) + 1);

  const form = useForm({
    defaultValues: {
      username: '',
      location: 'Global',
      gender: 'Other',
      age: 1,
      email: '',
    }
  });

  // Filter to only show online standard users, all VIP users, and all bot users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
                           
      if (!matchesSearch) return false;
      
      if (activeTab === 'standard') {
        return user.role === 'standard' && !user.isBot && user.isOnline; // Only show online standard users
      } else if (activeTab === 'vip') {
        return user.role === 'vip';
      } else if (activeTab === 'bots') {
        return user.isBot;
      } else if (activeTab === 'banned') {
        return user.isBanned || bannedUsers.some(banned => banned.userId === user.id);
      }
      
      return true;
    });
  }, [users, searchTerm, activeTab, bannedUsers]);

  const handleBanUser = (user: any) => {
    const newBannedUser: BannedUser = {
      username: user.username,
      userId: user.id,
      banReason: "Violation of terms of service",
      bannedAt: new Date(),
      banExpiresAt: new Date(Date.now() + 86400000 * 7), // 7 days from now
      bannedBy: "admin",
      ipAddress: "127.0.0.1"
    };
    
    addBannedUser(newBannedUser);
    toast.success(`${user.username} has been banned for 7 days`);
  };
  
  const handleUnbanUser = (userId: number, username: string) => {
    removeBannedUser(userId);
    toast.success(`${username} has been unbanned`);
  };
  
  const handleKickUser = (userId: number, username: string) => {
    kickUser(userId);
    toast.success(`${username} has been kicked from chat`);
  };
  
  const handleMakeVipPermanent = (userId: number, username: string) => {
    upgradeToVip(userId, username, true);
  };
  
  const handleMakeVipTemporary = (userId: number, username: string) => {
    setTempVipStatus(userId, username);
  };

  const handleAddBot = () => {
    const botId = nextBotId.current++;
    const newBotUser = {
      id: botId,
      username: newBot.username,
      role: "standard",
      isOnline: true,
      location: newBot.location,
      gender: newBot.gender,
      age: newBot.age,
      email: newBot.email || `${newBot.username.toLowerCase()}@bots.com`,
      isBot: true,
      isBanned: false
    };
    
    if (onAddBot) {
      onAddBot(newBotUser);
    }
    
    toast.success(`Bot ${newBot.username} added successfully`);
    setNewBot({
      username: '',
      location: 'Global',
      gender: 'Other',
      age: 1,
      email: '',
    });
    setIsAddBotDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="vip">VIP</TabsTrigger>
          <TabsTrigger value="bots">Bots</TabsTrigger>
          <TabsTrigger value="banned">Banned</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Standard Users</CardTitle>
              <CardDescription>
                Manage standard users who are currently online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Gender/Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{user.username}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isOnline ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          {user.gender}, {user.age}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleMakeVipTemporary(user.id, user.username)}>
                                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Temporary VIP</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMakeVipPermanent(user.id, user.username)}>
                                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Permanent VIP</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleKickUser(user.id, user.username)}>
                                <CircleOff className="mr-2 h-4 w-4 text-orange-500" />
                                <span>Kick User</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBanUser(user)}>
                                <Ban className="mr-2 h-4 w-4 text-red-500" />
                                <span>Ban User</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No standard users found that match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vip" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>VIP Users</CardTitle>
              <CardDescription>
                Manage users with VIP membership privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Gender/Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{user.username}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isOnline ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          {user.gender}, {user.age}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleKickUser(user.id, user.username)}>
                                <CircleOff className="mr-2 h-4 w-4 text-orange-500" />
                                <span>Kick User</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBanUser(user)}>
                                <Ban className="mr-2 h-4 w-4 text-red-500" />
                                <span>Ban User</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No VIP users found that match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bots" className="mt-0">
          <Card>
            <CardHeader className="pb-2 flex justify-between items-start">
              <div>
                <CardTitle>Chat Bots</CardTitle>
                <CardDescription>
                  Manage automated chat bots and their settings
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsAddBotDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Bot
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Gender/Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                {user.username} <BotIcon className="h-3 w-3 text-blue-500" />
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isOnline ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.location}</TableCell>
                        <TableCell>
                          {user.gender}, {user.age}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleKickUser(user.id, user.username)}>
                                <CircleOff className="mr-2 h-4 w-4 text-orange-500" />
                                <span>Disable Bot</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBanUser(user)}>
                                <Ban className="mr-2 h-4 w-4 text-red-500" />
                                <span>Remove Bot</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No bots found that match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="banned" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Banned Users</CardTitle>
              <CardDescription>
                Manage users who are currently banned from the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Gender/Age</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const bannedUser = bannedUsers.find(banned => banned.userId === user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{user.username}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              Banned
                            </Badge>
                          </TableCell>
                          <TableCell>{user.location}</TableCell>
                          <TableCell>
                            {user.gender}, {user.age}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUnbanUser(user.id, user.username)}>
                                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                                  <span>Unban User</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No banned users found that match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add VIP upgrade confirmation dialog */}
      <VipFeatures
        isMediaGalleryOpen={false}
        setIsMediaGalleryOpen={() => {}}
        mediaGalleryItems={[]}
        user={{
          id: 0,
          username: '',
          gender: '',
          age: 0,
          location: '',
          interests: [],
          isOnline: false
        }}
        isDeleteDialogOpen={false}
        setIsDeleteDialogOpen={() => {}}
        onConfirmDelete={() => {}}
        onCancelDelete={() => {}}
        isVipUpgradeDialogOpen={isVipUpgradeDialogOpen}
        setIsVipUpgradeDialogOpen={setIsVipUpgradeDialogOpen}
        vipUpgradeUser={vipUpgradeUser || undefined}
        onConfirmVipUpgrade={confirmTempVipStatus}
      />

      {/* Add Bot Dialog */}
      <Dialog open={isAddBotDialogOpen} onOpenChange={setIsAddBotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BotIcon className="h-5 w-5 text-blue-500" />
              Add New Bot
            </DialogTitle>
            <DialogDescription>
              Create a new chat bot for your platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bot-name">Bot Name</Label>
              <Input
                id="bot-name"
                placeholder="e.g., TravelBot, FitnessGuru"
                value={newBot.username}
                onChange={(e) => setNewBot({...newBot, username: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bot-location">Location</Label>
              <Input
                id="bot-location"
                placeholder="Global"
                value={newBot.location}
                onChange={(e) => setNewBot({...newBot, location: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bot-gender">Gender</Label>
                <Input
                  id="bot-gender"
                  placeholder="Other"
                  value={newBot.gender}
                  onChange={(e) => setNewBot({...newBot, gender: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bot-age">Age</Label>
                <Input
                  id="bot-age"
                  type="number"
                  placeholder="1"
                  value={newBot.age}
                  onChange={(e) => setNewBot({...newBot, age: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bot-email">Email (Optional)</Label>
              <Input
                id="bot-email"
                placeholder="botname@bots.com"
                value={newBot.email}
                onChange={(e) => setNewBot({...newBot, email: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                If left blank, an email will be auto-generated based on the bot name
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBotDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddBot}
              disabled={!newBot.username}
            >
              Add Bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
