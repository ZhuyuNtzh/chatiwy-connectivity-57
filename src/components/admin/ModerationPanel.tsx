
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flag, Trash2, RefreshCw, Ban, AlertCircle, MessageSquare } from 'lucide-react';
import { signalRService } from '@/services/signalRService';
import { UserReport } from '@/services/signalR/types';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';

const ModerationPanel = () => {
  const { addBannedUser } = useUser();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
    
    // Auto refresh reports every 15 seconds for instant updates
    const intervalId = setInterval(loadReports, 15000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadReports = () => {
    setLoading(true);
    console.log("Loading reports...");
    try {
      const allReports = signalRService.getReports();
      console.log("Got reports:", allReports);
      
      // If there are no reports, let's add a mock report for testing
      if (allReports.length === 0) {
        const mockReport = {
          id: `report_${Date.now()}`,
          reporterId: 123,
          reporterName: "User123",
          reportedId: 456,
          reportedName: "ToxicUser456",
          reason: "Inappropriate content",
          details: "User sent offensive messages during our conversation",
          timestamp: new Date(),
          status: "pending"
        };
        
        signalRService.addReport(mockReport);
        setReports([mockReport]);
      } else {
        setReports(allReports);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    try {
      signalRService.deleteReport(reportId);
      loadReports();
      toast.success('Report marked as resolved');
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to resolve report");
    }
  };
  
  const handleBanUser = (report: UserReport) => {
    try {
      // Create a banned user entry
      addBannedUser({
        username: report.reportedName,
        userId: report.reportedId,
        banReason: `Banned after report: ${report.reason}`,
        bannedAt: new Date(),
        banExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        bannedBy: 'admin',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      });
      
      // Delete the report
      signalRService.deleteReport(report.id);
      
      // Reload reports
      loadReports();
      
      toast.success(`${report.reportedName} has been banned for 7 days`);
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    }
  };

  const getReportSeverityClass = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('harassment') || lowerReason.includes('threat') || lowerReason.includes('abuse')) {
      return 'bg-red-100 text-red-800 border-red-300';
    } else if (lowerReason.includes('spam') || lowerReason.includes('inappropriate')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    } else {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };
  
  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Flag className="w-6 h-6 mr-2 text-red-600" />
          <h2 className="text-2xl font-bold">Chat Moderation</h2>
        </div>
        <Button 
          variant="outline" 
          onClick={loadReports}
          className="flex items-center gap-1"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All user reports are displayed here and will be automatically deleted after 24 hours if not addressed.
        </p>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-300px)]">
        {reports.length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 mb-2 text-gray-400" />
            <p className="font-medium">No reports to display</p>
            <p className="text-sm mt-1">When users report issues, they will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-4 shadow-sm border-l-4 border-l-red-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="mr-2">{report.reporterName} reported {report.reportedName}</span>
                        <Badge variant="outline" className={getReportSeverityClass(report.reason)}>
                          {report.reason}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mt-2 mb-3 text-sm">
                      {report.details}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Reported {getTimeSince(report.timestamp)} 
                        ({format(new Date(report.timestamp), 'MMM dd, yyyy HH:mm')})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBanUser(report)}
                      className="flex items-center gap-1"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Ban User
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Resolve
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ModerationPanel;
