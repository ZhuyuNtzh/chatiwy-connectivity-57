
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Upload, ImagePlus, Search, Settings } from 'lucide-react';
import { signalRService } from '@/services/signalRService';
import { toast } from 'sonner';

interface Avatar {
  id: string;
  url: string;
  name: string;
}

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('names');
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [newBannedWord, setNewBannedWord] = useState('');
  const [photoLimit, setPhotoLimit] = useState(5);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  useEffect(() => {
    loadBannedWords();
    loadSystemSettings();
    loadAvatars();
  }, []);
  
  const loadBannedWords = () => {
    const words = signalRService.getBannedWords();
    setBannedWords(words);
  };
  
  const loadSystemSettings = () => {
    // In a real app, we would fetch from the backend
    // For now, we'll use a mock value
    setPhotoLimit(5);
  };
  
  const loadAvatars = () => {
    // In a real app, we would fetch from the backend
    // For now, we'll use placeholders
    const mockAvatars: Avatar[] = [
      { id: '1', url: '/lovable-uploads/a1551f2b-73e8-42c5-b33d-842ef4dd9fd8.png', name: 'Avatar 1' },
      { id: '2', url: '/lovable-uploads/a427c90b-f62b-48e5-b2f6-e705879e6bba.png', name: 'Avatar 2' },
      { id: '3', url: '/lovable-uploads/c80784b4-1560-465c-ac27-ce7bab7aa1d5.png', name: 'Avatar 3' },
      { id: '4', url: '/lovable-uploads/e3b5491b-50db-4077-a99f-3de3837ccad6.png', name: 'Avatar 4' },
    ];
    setAvatars(mockAvatars);
  };

  const handleAddBannedWord = () => {
    if (!newBannedWord.trim()) {
      toast.error('Please enter a word to ban');
      return;
    }
    
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
  
  const handleSaveBannedWords = () => {
    // In a real app, we would persist to the backend
    toast.success('Banned words saved successfully');
  };
  
  const handleSavePhotoLimit = () => {
    // In a real app, we would persist to the backend
    toast.success(`Photo limit updated to ${photoLimit}`);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, we would upload to the backend
    // For now, we'll show a success message
    toast.success(`${files.length} avatar(s) uploaded successfully`);
    
    // Simulate adding new avatars
    const newAvatars = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    
    setAvatars(prev => [...prev, ...newAvatars]);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // In a real app, we would upload to the backend
    toast.success(`${files.length} avatar(s) uploaded successfully`);
    
    // Simulate adding new avatars
    const newAvatars = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    
    setAvatars(prev => [...prev, ...newAvatars]);
  };
  
  const filteredAvatars = avatars.filter(avatar => 
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md h-full max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 mr-2 text-amber-600" />
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>
      
      <Tabs defaultValue="names" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="names">
            Inappropriate Names
          </TabsTrigger>
          <TabsTrigger value="photos">
            Photo Sharing
          </TabsTrigger>
          <TabsTrigger value="avatars">
            Manage Avatars
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="names" className="flex-1 flex flex-col">
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
          
          <ScrollArea className="flex-1">
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
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleSaveBannedWords} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Sharing Limits</CardTitle>
              <CardDescription>
                Configure the maximum number of photos standard users can share in a day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="photo-limit">Daily photo limit for standard users</Label>
                  <span className="font-medium">{photoLimit}</span>
                </div>
                <Slider
                  id="photo-limit"
                  min={1}
                  max={20}
                  step={1}
                  value={[photoLimit]}
                  onValueChange={(value) => setPhotoLimit(value[0])}
                />
              </div>
              <Button onClick={handleSavePhotoLimit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="avatars" className="flex flex-col flex-1">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle>Manage Avatars</CardTitle>
              <CardDescription>
                Upload new avatars for VIP users to choose from
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold">Upload avatars</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Drag and drop image files or click to browse
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search avatars..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredAvatars.map((avatar) => (
                    <div key={avatar.id} className="relative group">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <p className="mt-1 text-xs truncate">{avatar.name}</p>
                    </div>
                  ))}
                  {filteredAvatars.length === 0 && (
                    <div className="col-span-full text-center p-8 text-gray-500 dark:text-gray-400">
                      <p>No avatars found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
