
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Upload, ImagePlus, Search, Settings, Check } from 'lucide-react';
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loadBannedWords();
    loadSystemSettings();
    loadAvatars();
  }, []);
  
  const loadBannedWords = () => {
    try {
      const words = signalRService.getBannedWords();
      setBannedWords(words);
    } catch (error) {
      console.error("Error loading banned words:", error);
      setBannedWords([]);
    }
  };
  
  const loadSystemSettings = () => {
    try {
      const limit = localStorage.getItem('photoLimit');
      if (limit) {
        setPhotoLimit(parseInt(limit));
      } else {
        setPhotoLimit(5);
      }
    } catch (error) {
      console.error("Error loading system settings:", error);
      setPhotoLimit(5);
    }
  };
  
  const loadAvatars = () => {
    try {
      const savedAvatars = localStorage.getItem('customAvatars');
      if (savedAvatars) {
        setAvatars(JSON.parse(savedAvatars));
      } else {
        // Default avatars
        const mockAvatars: Avatar[] = [
          { id: '1', url: '/lovable-uploads/a1551f2b-73e8-42c5-b33d-842ef4dd9fd8.png', name: 'Avatar 1' },
          { id: '2', url: '/lovable-uploads/a427c90b-f62b-48e5-b2f6-e705879e6bba.png', name: 'Avatar 2' },
          { id: '3', url: '/lovable-uploads/c80784b4-1560-465c-ac27-ce7bab7aa1d5.png', name: 'Avatar 3' },
          { id: '4', url: '/lovable-uploads/e3b5491b-50db-4077-a99f-3de3837ccad6.png', name: 'Avatar 4' },
        ];
        setAvatars(mockAvatars);
        localStorage.setItem('customAvatars', JSON.stringify(mockAvatars));
      }
    } catch (error) {
      console.error("Error loading avatars:", error);
      setAvatars([]);
    }
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
    
    setBannedWords(prev => [...prev, newBannedWord.toLowerCase()]);
    setNewBannedWord('');
    setHasChanges(true);
    toast.success('Word added to banned list');
  };

  const handleRemoveBannedWord = (word: string) => {
    setBannedWords(prev => prev.filter(w => w !== word));
    setHasChanges(true);
    toast.success('Word removed from banned list');
  };
  
  const handleSaveBannedWords = () => {
    try {
      // Use the new setBannedWords method instead of clearBannedWords
      signalRService.setBannedWords(bannedWords);
      
      // Save to localStorage as backup
      localStorage.setItem('bannedWords', JSON.stringify(bannedWords));
      
      setHasChanges(false);
      toast.success('Banned words saved successfully');
    } catch (error) {
      console.error("Error saving banned words:", error);
      toast.error('Failed to save banned words');
    }
  };
  
  const handleSavePhotoLimit = () => {
    try {
      // Save to localStorage
      localStorage.setItem('photoLimit', photoLimit.toString());
      
      // In a real app, we would persist to the backend
      toast.success(`Photo limit updated to ${photoLimit}`);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving photo limit:", error);
      toast.error('Failed to save photo limit');
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Create object URLs for immediate display
    const newAvatars = newFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    
    setAvatars(prev => [...prev, ...newAvatars]);
    setHasChanges(true);
    toast.success(`${files.length} avatar(s) uploaded`);
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
    
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Create object URLs for immediate display
    const newAvatars = newFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    
    setAvatars(prev => [...prev, ...newAvatars]);
    setHasChanges(true);
    toast.success(`${files.length} avatar(s) uploaded`);
  };
  
  const handleSaveAvatars = () => {
    try {
      // Save avatars to localStorage
      localStorage.setItem('customAvatars', JSON.stringify(avatars));
      
      // In a real app, we would upload files to the backend
      toast.success('Avatars saved successfully');
      setUploadedFiles([]);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving avatars:", error);
      toast.error('Failed to save avatars');
    }
  };
  
  const handleRemoveAvatar = (avatarId: string) => {
    setAvatars(prev => prev.filter(avatar => avatar.id !== avatarId));
    setHasChanges(true);
    toast.success('Avatar removed');
  };
  
  const filteredAvatars = avatars.filter(avatar => 
    avatar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 h-full max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 mr-2 text-amber-600" />
        <h2 className="text-2xl font-bold">System Settings</h2>
      </div>
      
      <Tabs defaultValue="names" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
        <TabsList className="mb-6 sticky top-0 z-10">
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
        
        <ScrollArea className="flex-1">
          <TabsContent value="names" className="flex-1 flex flex-col space-y-4">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBannedWord();
                  }
                }}
              />
              <Button onClick={handleAddBannedWord}>
                Add
              </Button>
            </div>
            
            <div className="flex-1 mb-4">
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
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10 pb-2">
              <Button 
                onClick={handleSaveBannedWords} 
                className="w-full"
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="photos" className="space-y-4 pb-6">
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
                    onValueChange={(value) => {
                      setPhotoLimit(value[0]);
                      setHasChanges(true);
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSavePhotoLimit} 
                  disabled={!hasChanges}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="avatars" className="flex flex-col flex-1 pb-10">
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
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
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
                
                <div className="flex-1 mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredAvatars.map((avatar) => (
                      <div key={avatar.id} className="relative group">
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemoveAvatar(avatar.id)}
                          >
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
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10 pb-2">
                  <Button 
                    onClick={handleSaveAvatars} 
                    className="w-full"
                    disabled={!hasChanges}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Avatars
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Floating save button that appears when changes are made */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => {
              if (activeTab === 'names') handleSaveBannedWords();
              if (activeTab === 'photos') handleSavePhotoLimit();
              if (activeTab === 'avatars') handleSaveAvatars();
            }}
          >
            <Save className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
