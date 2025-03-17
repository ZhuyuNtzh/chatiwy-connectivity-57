
import React from 'react';
import {
  MoreVertical, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import HeaderDropdownContent from './HeaderDropdownContent';
import UserInfo from './UserInfo';

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
  onKickUser?: () => void;
  onBanUser?: () => void;
  isAdmin?: boolean;
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
  onKickUser,
  onBanUser,
  isAdmin,
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
      <UserInfo user={user} countryFlags={countryFlags} />
      
      <div className="flex items-center">
        <DropdownMenu open={showOptions} onOpenChange={onShowOptions}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          
          <HeaderDropdownContent 
            onBlockUser={onBlockUser}
            onReportUser={onReportUser}
            onShowBlockedUsers={onShowBlockedUsers}
            onToggleTranslation={onToggleTranslation}
            isTranslationEnabled={isTranslationEnabled}
            onSelectLanguage={onSelectLanguage}
            selectedLanguage={selectedLanguage}
            onShowMediaGallery={onShowMediaGallery}
            onDeleteConversation={onDeleteConversation}
            onKickUser={onKickUser}
            onBanUser={onBanUser}
            isAdmin={isAdmin}
          />
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-1" 
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
