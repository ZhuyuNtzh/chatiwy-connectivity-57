
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Track if deletion is in progress to prevent multiple clicks
  const [isDeletionInProgress, setIsDeletionInProgress] = useState(false);

  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteConversation = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    // Prevent multiple executions
    if (isDeletionInProgress) return;
    
    try {
      setIsDeletionInProgress(true);
      setMessages([]);
      setMediaGalleryItems([]);
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setIsDeletionInProgress(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const cancelDeleteConversation = () => {
    // Simple function to close the dialog
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
