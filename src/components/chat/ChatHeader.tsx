
import React from 'react';
import { MoreVertical, X, UserMinus, Flag, Globe, Image, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';

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
  onSelectLanguage?: (lang: string) => void;
  selectedLanguage?: string;
  onShowMediaGallery?: () => void;
  onDeleteConversation?: () => void;
}

const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

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
  selectedLanguage = 'en',
  onShowMediaGallery,
  onDeleteConversation
}) => {
  const { userRole } = useUser();
  const isVip = userRole === 'vip';
  
  return (
    <div className="flex items-center justify-between p-3 relative">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
          user.isOnline 
            ? 'bg-green-100 dark:bg-green-900/30' 
            : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          <span className={`w-6 h-6 text-lg font-semibold ${
            user.isOnline 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{user.username}</h3>
            <div className={`ml-2 w-2 h-2 rounded-full ${
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            {countryFlags[user.location] && (
              <img 
                src={countryFlags[user.location]} 
                alt={`${user.location} flag`}
                className="w-3.5 h-2.5 mr-1 object-cover"
              />
            )}
            <span>{user.location}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <DropdownMenu open={showOptions} onOpenChange={onShowOptions}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800">
            <DropdownMenuItem onClick={onBlockUser} className="text-red-600 dark:text-red-400">
              <UserMinus className="h-4 w-4 mr-2" />
              Block user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReportUser}>
              <Flag className="h-4 w-4 mr-2" />
              Report user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowBlockedUsers}>
              <Users className="h-4 w-4 mr-2" />
              Blocked users
            </DropdownMenuItem>
            
            {isVip && onShowMediaGallery && (
              <DropdownMenuItem onClick={onShowMediaGallery}>
                <Image className="h-4 w-4 mr-2" />
                Shared media
              </DropdownMenuItem>
            )}
            
            {isVip && onDeleteConversation && (
              <DropdownMenuItem onClick={onDeleteConversation} className="text-red-600 dark:text-red-400">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete conversation
              </DropdownMenuItem>
            )}
            
            {isVip && onToggleTranslation && (
              <>
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    <Label htmlFor="translation-toggle" className="text-sm cursor-pointer">
                      Translation
                    </Label>
                  </div>
                  <Switch 
                    id="translation-toggle" 
                    checked={isTranslationEnabled} 
                    onCheckedChange={onToggleTranslation}
                  />
                </div>
                
                {isTranslationEnabled && onSelectLanguage && (
                  <div className="px-2 py-1.5">
                    <Select value={selectedLanguage} onValueChange={onSelectLanguage}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800">
                        {supportedLanguages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
