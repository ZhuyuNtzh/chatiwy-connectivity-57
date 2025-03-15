
import React from 'react';
import UserAvatar from './UserAvatar';
import UserBrief from './UserBrief';
import HeaderOptions from './HeaderOptions';
import HeaderDropdownContent from './HeaderDropdownContent';

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
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <UserAvatar 
          username={user.username} 
          isOnline={user.isOnline} 
        />
        
        <UserBrief
          username={user.username}
          age={user.age}
          gender={user.gender}
          location={user.location}
          interests={user.interests}
          countryFlags={countryFlags}
        />
      </div>
      
      <HeaderOptions
        showOptions={showOptions}
        onShowOptions={onShowOptions}
        onClose={onClose}
      >
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
        />
      </HeaderOptions>
    </div>
  );
};

export default ChatHeader;
