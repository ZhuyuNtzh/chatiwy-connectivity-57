
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
    try {
      // Set deleting flag to prevent multiple clicks
      setIsDeleting(true);
      
      // Clear messages from UI first for immediate feedback
      setMessages([]);
      setMediaGalleryItems([]);
      
      // Clear messages from storage for the selected user
      const selectedUserId = signalRService.currentSelectedUserId;
      if (selectedUserId) {
        // Use the async version of clearAllChatHistory
        await signalRService.clearAllChatHistory();
      }
      
      // Show success message
      toast.success('Conversation deleted');
      
      // Close dialog and reset deleting flag
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };
  
  const cancelDeleteConversation = () => {
    // Only allow cancel if not in the middle of deleting
    if (!isDeleting) {
      // Simply close the dialog without any other actions
      setIsDeleteDialogOpen(false);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation
  };
};
