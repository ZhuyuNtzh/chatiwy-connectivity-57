
import React from 'react';
import MediaGalleryDialog from './MediaGalleryDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import VipUpgradeConfirmation from '../admin/VipUpgradeConfirmation';

interface VipFeaturesProps {
  isMediaGalleryOpen: boolean;
  setIsMediaGalleryOpen: (isOpen: boolean) => void;
  mediaGalleryItems: Array<{
    type: 'image' | 'voice' | 'link';
    url: string;
    timestamp: Date;
  }>;
  user: {
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  };
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  // Added for admin VIP upgrade
  isVipUpgradeDialogOpen?: boolean;
  setIsVipUpgradeDialogOpen?: (isOpen: boolean) => void;
  vipUpgradeUser?: {
    id: number;
    username: string;
  };
  onConfirmVipUpgrade?: (userId: number, username: string, expiryDate: Date) => void;
  isDeletionInProgress?: boolean;
}

const VipFeatures: React.FC<VipFeaturesProps> = ({
  isMediaGalleryOpen,
  setIsMediaGalleryOpen,
  mediaGalleryItems,
  user,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onConfirmDelete,
  onCancelDelete,
  isVipUpgradeDialogOpen,
  setIsVipUpgradeDialogOpen,
  vipUpgradeUser,
  onConfirmVipUpgrade,
  isDeletionInProgress = false
}) => {
  console.log('Rendering VipFeatures, isDeleteDialogOpen:', isDeleteDialogOpen);
  
  const handleDeleteConfirm = () => {
    console.log('VipFeatures: handleDeleteConfirm called');
    onConfirmDelete();
  };
  
  const handleDeleteCancel = () => {
    console.log('VipFeatures: handleDeleteCancel called');
    onCancelDelete();
  };
  
  const handleDeleteDialogOpenChange = (open: boolean) => {
    console.log('VipFeatures: Delete dialog open state changing to:', open);
    setIsDeleteDialogOpen(open);
  };

  return (
    <>
      <MediaGalleryDialog
        isOpen={isMediaGalleryOpen}
        onOpenChange={setIsMediaGalleryOpen}
        mediaItems={mediaGalleryItems}
        user={user}
      />
      
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeletionInProgress}
      />

      {onConfirmVipUpgrade && setIsVipUpgradeDialogOpen && vipUpgradeUser && (
        <VipUpgradeConfirmation
          isOpen={isVipUpgradeDialogOpen || false}
          onOpenChange={setIsVipUpgradeDialogOpen}
          user={vipUpgradeUser}
          onConfirm={onConfirmVipUpgrade}
        />
      )}
    </>
  );
};

export default VipFeatures;
