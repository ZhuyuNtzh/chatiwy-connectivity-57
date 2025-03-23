
import React, { useState } from "react";
import { useAdminMonitoring } from "@/hooks/useAdminMonitoring";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  MoreVertical,
  Infinity,
  Crown,
  Bot,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminActionsDialog from "./AdminActionsDialog";
import type { ChatMessage } from "@/services/signalR/types";

const AdminMonitoringDashboard: React.FC = () => {
  const { activeUsers, messageStats, selectedUserId, setSelectedUserId, userMessages } = useAdminMonitoring();
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false);
  const [selectedActionUser, setSelectedActionUser] = useState<{ id: number; username: string } | null>(null);

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleActionClick = (user: { id: number; username: string }) => {
    setSelectedActionUser(user);
    setIsActionsDialogOpen(true);
  };

  const formatTime = (date?: Date) => {
    if (!date) return "Unknown";
    return date.toLocaleString();
  };

  // Function to format message timestamps
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stats Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-500" />
            Active Users
          </CardTitle>
          <CardDescription>Currently online and active users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {activeUsers.filter(u => u.isOnline).length}
          </div>
          <p className="text-sm text-muted-foreground">
            Out of {activeUsers.length} total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
            Messages
          </CardTitle>
          <CardDescription>Total messages in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{messageStats.total}</div>
          <p className="text-sm text-muted-foreground">
            {messageStats.lastHour} in the last hour
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Flagged Content
          </CardTitle>
          <CardDescription>Messages flagged for review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{messageStats.flaggedCount}</div>
          <p className="text-sm text-muted-foreground">
            {Math.round((messageStats.flaggedCount / (messageStats.total || 1)) * 100)}% of all
            messages
          </p>
        </CardContent>
      </Card>

      {/* Active Users Table */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>User Activity</CardTitle>
          <CardDescription>
            All users who have been active in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <TableRow key={user.userId} className={selectedUserId === user.userId ? "bg-muted/50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1">
                          <span className="cursor-pointer hover:underline" onClick={() => handleUserClick(user.userId)}>
                            {user.username}
                          </span>
                          {user.isVip && <Crown className="h-3 w-3 text-amber-500" />}
                          {user.isBot && <Bot className="h-3 w-3 text-blue-500" />}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isOnline ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Offline
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastActive ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatTime(user.lastActive)}
                        </div>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                    <TableCell>{user.messageCount || 0}</TableCell>
                    <TableCell>
                      {user.reportCount ? (
                        <Badge variant="destructive">{user.reportCount}</Badge>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleUserClick(user.userId)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>View Messages</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleActionClick({ id: user.userId, username: user.username })}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Take Action</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User Chat History */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle>User Messages</CardTitle>
          <CardDescription>
            {selectedUserId
              ? `Messages for ${activeUsers.find(u => u.userId === selectedUserId)?.username || "User"}`
              : "Select a user to view their messages"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {selectedUserId ? (
              userMessages.length > 0 ? (
                <div className="space-y-4">
                  {userMessages.map((message: ChatMessage) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg text-sm ${
                        message.senderId === selectedUserId
                          ? "bg-primary/10 ml-4"
                          : "bg-muted/50 mr-4"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">
                          {message.senderId === selectedUserId
                            ? "Sent"
                            : "Received"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages found
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a user to view their messages
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Admin Actions Dialog */}
      <AdminActionsDialog
        isOpen={isActionsDialogOpen}
        onOpenChange={setIsActionsDialogOpen}
        user={selectedActionUser}
      />
    </div>
  );
};

export default AdminMonitoringDashboard;
