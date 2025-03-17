
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, Trash2, RefreshCw } from 'lucide-react';
import { signalRService } from '@/services/signalRService';
import { UserReport } from '@/services/signalR/types';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const ModerationPanel = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReports();
    
    // Auto refresh reports every 15 seconds for instant updates
    const intervalId = setInterval(loadReports, 15000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadReports = () => {
    setIsLoading(true);
    console.log("Loading reports...");
    try {
      // Make sure signalRService is properly initialized and has this method
      const allReports = signalRService.getReports();
      console.log("Got reports:", allReports);
      
      // Filter out reports older than 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filteredReports = allReports.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate > twentyFourHoursAgo;
      });
      
      setReports(filteredReports);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    try {
      signalRService.deleteReport(reportId);
      // Update the local state to remove the deleted report
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
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
        className="mb-4 self-end flex items-center gap-2"
        onClick={loadReports}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
