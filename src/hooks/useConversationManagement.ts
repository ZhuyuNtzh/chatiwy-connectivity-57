
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
    if (isDeletionInProgress) return;
    
    setIsDeletionInProgress(true);
    
    // Perform the deletion
    setMessages([]);
    setMediaGalleryItems([]);
    
    // Show confirmation
    toast.success('Conversation deleted');
    
    // Reset state
    setIsDeletionInProgress(false);
    setIsDeleteDialogOpen(false);
  };
  
  const cancelDeleteConversation = () => {
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
