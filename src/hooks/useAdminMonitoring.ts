
import { useState, useEffect } from 'react';
import { signalRService } from '@/services/signalRService';
import type { ChatMessage } from '@/services/signalR/types';

export interface ActiveUserStat {
  userId: number;
  username: string;
  isOnline: boolean;
  lastActive?: Date;
  messageCount?: number;
  reportCount?: number;
  isVip?: boolean;
  isBot?: boolean;
}

export const useAdminMonitoring = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUserStat[]>([]);
  const [messageStats, setMessageStats] = useState<{
    total: number;
    lastHour: number;
    flaggedCount: number;
  }>({ total: 0, lastHour: 0, flaggedCount: 0 });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  
  // Monitor active users
  useEffect(() => {
    // In a real app, this would fetch from a live API
    // For now, we'll generate mock data based on stored messages
    const fetchActiveUsers = () => {
      try {
        // Get all messages to generate statistics
        const allMessages = signalRService.getChatHistory(0); // Use 0 to get all messages
        
        // Create a map of users to their messages
        const userMap = new Map<number, ChatMessage[]>();
        const usernames = new Map<number, string>();
        
        allMessages.forEach(msg => {
          if (!userMap.has(msg.senderId)) {
            userMap.set(msg.senderId, []);
          }
          userMap.get(msg.senderId)?.push(msg);
          usernames.set(msg.senderId, msg.senderName);
        });
        
        // Get reports
        const reports = signalRService.getReports();
        const reportCounts = new Map<number, number>();
        
        reports.forEach(report => {
          const reportedId = report.reportedId;
          if (!reportCounts.has(reportedId)) {
            reportCounts.set(reportedId, 0);
          }
          reportCounts.set(reportedId, (reportCounts.get(reportedId) || 0) + 1);
        });
        
        // Create active user statistics
        const users: ActiveUserStat[] = [];
        
        userMap.forEach((messages, userId) => {
          const lastMessage = messages[messages.length - 1];
          const lastActive = lastMessage ? new Date(lastMessage.timestamp) : undefined;
          
          // Check if the user has any message in the last hour
          const lastHour = new Date();
          lastHour.setHours(lastHour.getHours() - 1);
          const isOnline = lastActive ? lastActive > lastHour : false;
          
          users.push({
            userId,
            username: usernames.get(userId) || `User ${userId}`,
            isOnline,
            lastActive,
            messageCount: messages.length,
            reportCount: reportCounts.get(userId) || 0,
            isVip: false, // In a real app, get from user profile
            isBot: false  // In a real app, get from user profile
          });
        });
        
        // Sort by online status and then by last active
        users.sort((a, b) => {
          if (a.isOnline !== b.isOnline) {
            return a.isOnline ? -1 : 1;
          }
          if (a.lastActive && b.lastActive) {
            return b.lastActive.getTime() - a.lastActive.getTime();
          }
          return 0;
        });
        
        setActiveUsers(users);
        
        // Calculate overall stats
        const lastHour = new Date();
        lastHour.setHours(lastHour.getHours() - 1);
        
        const lastHourMessages = allMessages.filter(
          msg => new Date(msg.timestamp) > lastHour
        ).length;
        
        const flaggedMessages = allMessages.filter(
          msg => msg.isReported
        ).length;
        
        setMessageStats({
          total: allMessages.length,
          lastHour: lastHourMessages,
          flaggedCount: flaggedMessages
        });
      } catch (error) {
        console.error('Error monitoring active users:', error);
      }
    };

    // Initial fetch
    fetchActiveUsers();
    
    // Set up interval for regular updates
    const interval = setInterval(fetchActiveUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Load user's chat history when a user is selected
  useEffect(() => {
    if (selectedUserId !== null) {
      try {
        // In a real app, this would fetch from the database
        const allMessages = signalRService.getChatHistory(0); // 0 to get all messages
        const userMsgs = allMessages.filter(
          msg => msg.senderId === selectedUserId || msg.receiverId === selectedUserId
        );
        
        // Sort messages by timestamp
        userMsgs.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        setUserMessages(userMsgs);
      } catch (error) {
        console.error(`Error fetching messages for user ${selectedUserId}:`, error);
        setUserMessages([]);
      }
    } else {
      setUserMessages([]);
    }
  }, [selectedUserId]);
  
  return {
    activeUsers,
    messageStats,
    selectedUserId,
    setSelectedUserId,
    userMessages
  };
};
