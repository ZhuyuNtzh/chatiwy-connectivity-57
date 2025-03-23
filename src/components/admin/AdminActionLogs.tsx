
import React from 'react';
import { useAdminActions } from '@/hooks/useAdminActions';
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Clock } from "lucide-react";

const AdminActionLogs: React.FC = () => {
  const { getAdminActionLogs } = useAdminActions();
  const logs = getAdminActionLogs();
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  // Get badge variant based on action type
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'kick':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Kick</Badge>;
      case 'ban':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Ban</Badge>;
      case 'unban':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Unban</Badge>;
      case 'vip_upgrade':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">VIP Upgrade</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-purple-500" />
          Admin Action Logs
        </CardTitle>
        <CardDescription>
          Record of all administrative actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(log.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      {log.targetUsername}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.action === 'ban' && <span>Reason: {log.reason}</span>}
                      {log.action === 'kick' && <span>Duration: {log.duration}</span>}
                      {log.action === 'vip_upgrade' && (
                        <span>
                          Duration: {log.duration === 'monthly' ? '1 month' : '1 year'}
                          {log.expiresAt && ` (until ${formatTime(log.expiresAt)})`}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No admin actions recorded yet
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminActionLogs;
