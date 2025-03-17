
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';
import { signalRService } from '@/services/signalRService';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (isDeleting) return; // Prevent multiple deletion attempts
    
    try {
      setIsDeleting(true); // Set loading state
      
      // Clear UI immediately to improve perceived performance
      setMessages([]);
      setMediaGalleryItems([]);

      // Clear messages from storage asynchronously
      await signalRService.clearAllChatHistory();

      // Show success message
      toast.success('Conversation deleted successfully');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
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
    isDeleting
  };
};
