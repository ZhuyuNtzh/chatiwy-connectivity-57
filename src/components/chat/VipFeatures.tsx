
import React from 'react';
import MediaGalleryDialog from './MediaGalleryDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

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
  isDeletingConversation?: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

const VipFeatures: React.FC<VipFeaturesProps> = ({
  isMediaGalleryOpen,
  setIsMediaGalleryOpen,
  mediaGalleryItems,
  user,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isDeletingConversation = false,
  onConfirmDelete,
  onCancelDelete
}) => {
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
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
        isDeleting={isDeletingConversation}
      />
    </>
  );
};

export default VipFeatures;
