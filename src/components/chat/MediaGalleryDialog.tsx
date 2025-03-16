
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Link, Mic } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'voice' | 'link';
  url: string;
  timestamp: Date;
}

interface MediaGalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mediaItems: MediaItem[];
  user: {
    username: string;
  };
}

const MediaGalleryDialog: React.FC<MediaGalleryDialogProps> = ({
  isOpen,
  onOpenChange,
  mediaItems,
  user
}) => {
  const [selectedTab, setSelectedTab] = useState('images');
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state with external state
  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const imageItems = mediaItems.filter(item => item.type === 'image');
  const voiceItems = mediaItems.filter(item => item.type === 'voice');
  const linkItems = mediaItems.filter(item => item.type === 'link');
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleClose = () => {
    setSelectedTab('images'); // Reset to default tab
    setInternalOpen(false);
    
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // Use setTimeout to ensure React has time to process state updates
    closeTimeoutRef.current = setTimeout(() => {
      onOpenChange(false);
    }, 50);
  };
  
  return (
    <Dialog 
      open={internalOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          setInternalOpen(open);
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-800" 
        onClick={(e) => e.stopPropagation()}
        onInteractOutside={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleClose();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onPointerDownOutside={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleClose();
        }}
      >
        <DialogHeader>
          <DialogTitle>Shared Media with {user.username}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="images" value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Images ({imageItems.length})
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice ({voiceItems.length})
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Links ({linkItems.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images" className="flex-1 overflow-y-auto p-2">
            {imageItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imageItems.map((item, index) => (
                  <div key={index} className="relative group cursor-pointer overflow-hidden rounded-md">
                    <img 
                      src={item.url} 
                      alt={`Shared image ${index}`} 
                      className="w-full h-24 object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                      <span className="text-xs text-white">{formatDate(item.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No images shared
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="voice" className="flex-1 overflow-y-auto p-2">
            {voiceItems.length > 0 ? (
              <div className="space-y-2">
                {voiceItems.map((item, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.timestamp)}
                    </div>
                    <audio controls src={item.url} className="w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No voice messages shared
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="links" className="flex-1 overflow-y-auto p-2">
            {linkItems.length > 0 ? (
              <div className="space-y-2">
                {linkItems.map((item, index) => (
                  <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.timestamp)}
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {item.url}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No links shared
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MediaGalleryDialog;
