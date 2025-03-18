
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletionInProgress, setIsDeletionInProgress] = useState(false);

  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteConversation = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    // Guard clause to prevent multiple deletion operations
    if (isDeletionInProgress) return;
    
    // Set the deletion flag
    setIsDeletionInProgress(true);
    
    try {
      // Perform the actual deletion
      setMessages([]);
      setMediaGalleryItems([]);
      
      // Show successful toast notification
      toast.success('Conversation deleted');
    } catch (error) {
      // Handle any errors
      console.error('Error during conversation deletion:', error);
      toast.error('Failed to delete conversation');
    } finally {
      // Always reset the state
      setIsDeletionInProgress(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const cancelDeleteConversation = () => {
    // Simple cancel that just closes the dialog
    setIsDeleteDialogOpen(false);
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation,
    isDeletionInProgress
  };
};
