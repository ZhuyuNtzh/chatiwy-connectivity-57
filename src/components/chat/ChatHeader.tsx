
import React from 'react';
import { X, MoreVertical, Flag, Ban, Globe, Users, Languages, Image, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  user: {
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  };
  countryFlags: Record<string, string>;
  onClose: () => void;
  showOptions: boolean;
  onShowOptions: (show: boolean) => void;
  onBlockUser: () => void;
  onReportUser: () => void;
  onShowBlockedUsers: () => void;
  onToggleTranslation?: () => void;
  isTranslationEnabled?: boolean;
  onSelectLanguage?: (language: string) => void;
  selectedLanguage?: string;
  onShowMediaGallery?: () => void;
  onDeleteConversation?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  countryFlags,
  onClose,
  showOptions,
  onShowOptions,
  onBlockUser,
  onReportUser,
  onShowBlockedUsers,
  onToggleTranslation,
  isTranslationEnabled,
  onSelectLanguage,
  selectedLanguage,
  onShowMediaGallery,
  onDeleteConversation,
}) => {
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'ar', label: 'Arabic' },
  ];

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="relative mr-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-primary font-medium text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          {user.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
          )}
        </div>
        
        <div>
          <div className="flex items-center">
            <h2 className="text-base font-medium">{user.username}</h2>
            {user.interests.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {user.interests[0]}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-1">{user.age} • {user.gender}</span>
            {user.location && countryFlags[user.location] && (
              <div className="flex items-center">
                <span className="mx-1">•</span>
                <img 
                  src={countryFlags[user.location]} 
                  alt={user.location}
                  className="h-3 w-4 object-cover mr-1"
                />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <DropdownMenu open={showOptions} onOpenChange={onShowOptions}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onReportUser} className="text-amber-600 dark:text-amber-400">
              <Flag className="mr-2 h-4 w-4" />
              <span>Report user</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBlockUser} className="text-red-600 dark:text-red-400">
              <Ban className="mr-2 h-4 w-4" />
              <span>Block user</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShowBlockedUsers}>
              <Users className="mr-2 h-4 w-4" />
              <span>Blocked users</span>
            </DropdownMenuItem>
            
            {onToggleTranslation && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleTranslation}>
                  <Languages className="mr-2 h-4 w-4" />
                  <span>{isTranslationEnabled ? 'Disable translation' : 'Enable translation'}</span>
                </DropdownMenuItem>
                {isTranslationEnabled && onSelectLanguage && (
                  <div className="px-2 py-1.5">
                    <Select value={selectedLanguage} onValueChange={onSelectLanguage}>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            
            {onShowMediaGallery && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onShowMediaGallery}>
                  <Image className="mr-2 h-4 w-4" />
                  <span>Media gallery</span>
                </DropdownMenuItem>
              </>
            )}
            
            {onDeleteConversation && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDeleteConversation} className="text-red-600 dark:text-red-400">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete conversation</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
