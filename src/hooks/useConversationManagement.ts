
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteConversation = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setIsDeletingConversation(true);
    
    // Use setTimeout to move deletion to the next event loop tick
    // This prevents UI freezing by allowing the rendering cycle to complete
    setTimeout(() => {
      try {
        // Process deletion in small batches if needed
        setMessages([]);
        setMediaGalleryItems([]);
        toast.success('Conversation deleted');
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
      } finally {
        setIsDeletingConversation(false);
        setIsDeleteDialogOpen(false);
      }
    }, 0);
  };
  
  const cancelDeleteConversation = () => {
    setIsDeleteDialogOpen(false);
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeletingConversation,
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation
  };
};
