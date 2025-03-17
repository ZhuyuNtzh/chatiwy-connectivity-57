
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, Trash2 } from 'lucide-react';
import { signalRService } from '@/services/signalRService';
import { UserReport } from '@/services/signalR/types';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserTypeDisplay from '@/components/UserTypeDisplay';

const ModerationPanel = () => {
  const [reports, setReports] = useState<UserReport[]>([]);

  useEffect(() => {
    loadReports();
    
    // Auto refresh reports every 15 seconds for instant updates
    const intervalId = setInterval(loadReports, 15000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadReports = () => {
    console.log("Loading reports...");
    try {
      const allReports = signalRService.getReports();
      console.log("Got reports:", allReports);
      setReports(allReports);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    }
  };

  const handleDeleteReport = (reportId: string) => {
    try {
      signalRService.deleteReport(reportId);
      loadReports();
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex items-center mb-6">
        <Flag className="w-6 h-6 mr-2 text-red-600" />
        <h2 className="text-2xl font-bold">Chat Moderation</h2>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          All user reports are displayed here and are automatically deleted after 24 hours.
        </p>
      </div>

      <Button 
        variant="outline" 
        className="mb-4 self-end"
        onClick={loadReports}
      >
        Refresh Reports
      </Button>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {reports.length === 0 ? (
          <div className="text-center p-8 text-gray-500 dark:text-gray-400">
            <p>No reports to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {report.reporterName} reported {report.reportedName}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {new Date(report.timestamp).toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Reason: {report.reason}
                    </p>
                    {report.details && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {report.details}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ModerationPanel;
