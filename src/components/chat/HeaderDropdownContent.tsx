
import React from 'react';
import { Flag, Ban, Users, Languages, Image, Trash, UserX, Shield } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderDropdownContentProps {
  onBlockUser: () => void;
  onReportUser: () => void;
  onShowBlockedUsers: () => void;
  onToggleTranslation?: () => void;
  isTranslationEnabled?: boolean;
  onSelectLanguage?: (language: string) => void;
  selectedLanguage?: string;
  onShowMediaGallery?: () => void;
  onDeleteConversation?: () => void;
  onKickUser?: () => void;
  onBanUser?: () => void;
  isAdmin?: boolean;
}

const HeaderDropdownContent: React.FC<HeaderDropdownContentProps> = ({
  onBlockUser,
  onReportUser,
  onShowBlockedUsers,
  onToggleTranslation,
  isTranslationEnabled,
  onSelectLanguage,
  selectedLanguage,
  onShowMediaGallery,
  onDeleteConversation,
  onKickUser,
  onBanUser,
  isAdmin,
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
    <DropdownMenuContent align="end" className="w-56">
      {!isAdmin && (
        <>
          <DropdownMenuItem onClick={onReportUser} className="text-amber-600 dark:text-amber-400">
            <Flag className="mr-2 h-4 w-4" />
            <span>Report user</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBlockUser} className="text-red-600 dark:text-red-400">
            <Ban className="mr-2 h-4 w-4" />
            <span>Block user</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      
      {isAdmin && (
        <>
          <DropdownMenuItem onClick={onKickUser} className="text-amber-600 dark:text-amber-400">
            <UserX className="mr-2 h-4 w-4" />
            <span>Kick user</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBanUser} className="text-red-600 dark:text-red-400">
            <Shield className="mr-2 h-4 w-4" />
            <span>Ban user</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      
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
  );
};

export default HeaderDropdownContent;
