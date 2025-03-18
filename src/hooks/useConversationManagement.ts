
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Track deletion state to prevent multiple operations
  const [isDeletionInProgress, setIsDeletionInProgress] = useState(false);

  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteConversation = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    // Prevent multiple deletion attempts while one is in progress
    if (isDeletionInProgress) return;
    
    try {
      // Set deletion in progress to prevent multiple clicks
      setIsDeletionInProgress(true);
      
      // Perform the actual deletion
      setMessages([]);
      setMediaGalleryItems([]);
      
      // Show success message
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      // Reset state and close dialog regardless of success/failure
      setIsDeletionInProgress(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const cancelDeleteConversation = () => {
    // Just close the dialog without performing any deletion
    if (!isDeletionInProgress) {
      setIsDeleteDialogOpen(false);
    }
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
