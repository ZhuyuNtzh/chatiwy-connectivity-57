
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { signalRService } from '@/services/signalRService';
import { UserReport } from '@/services/signalR/types';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const ModerationPanel = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<UserReport[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [newBannedWord, setNewBannedWord] = useState('');

  // Load reports and banned words on mount
  useEffect(() => {
    loadReports();
    loadBannedWords();
    
    // Auto refresh reports every minute
    const intervalId = setInterval(loadReports, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const loadReports = () => {
    const allReports = signalRService.getReports();
    setReports(allReports);
  };

  const loadBannedWords = () => {
    const words = signalRService.getBannedWords();
    setBannedWords(words);
  };

  const handleDeleteReport = (reportId: string) => {
    signalRService.deleteReport(reportId);
    loadReports();
    toast.success('Report deleted successfully');
  };

  const handleAddBannedWord = () => {
    if (!newBannedWord.trim()) {
      toast.error('Please enter a word to ban');
      return;
    }
    
    // Check if word already exists
    if (bannedWords.includes(newBannedWord.toLowerCase())) {
      toast.error('This word is already banned');
      return;
    }
    
    signalRService.addBannedWord(newBannedWord.toLowerCase());
    loadBannedWords();
    setNewBannedWord('');
    toast.success('Word added to banned list');
  };

  const handleRemoveBannedWord = (word: string) => {
    signalRService.removeBannedWord(word);
    loadBannedWords();
    toast.success('Word removed from banned list');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
      <div className="flex items-center mb-6">
        <Flag className="w-6 h-6 mr-2 text-red-600" />
        <h2 className="text-2xl font-bold">Chat Moderation</h2>
      </div>

      <Tabs defaultValue="reports" className="flex flex-col flex-1">
        <TabsList className="mb-6">
          <TabsTrigger value="reports" onClick={() => setActiveTab('reports')}>
            <div className="flex items-center">
              <Flag className="w-4 h-4 mr-2" />
              <span>User Reports</span>
              {reports.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {reports.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="words" onClick={() => setActiveTab('words')}>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span>Banned Words</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All user reports are displayed here and are automatically deleted after 24 hours.
            </p>
          </div>

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
        </TabsContent>

        <TabsContent value="words" className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Banned words will be filtered from nicknames and prevented during registration.
            </p>
          </div>

          <div className="flex mb-4">
            <Input
              placeholder="Add new banned word..."
              value={newBannedWord}
              onChange={(e) => setNewBannedWord(e.target.value)}
              className="mr-2"
            />
            <Button onClick={handleAddBannedWord}>
              <Save className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="flex flex-wrap gap-2">
              {bannedWords.map((word) => (
                <Badge
                  key={word}
                  variant="secondary"
                  className="px-3 py-1 flex items-center gap-1"
                >
                  {word}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => handleRemoveBannedWord(word)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {bannedWords.length === 0 && (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <p>No banned words defined yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationPanel;
