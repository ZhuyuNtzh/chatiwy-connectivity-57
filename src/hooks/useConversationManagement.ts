
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';
import { signalRService } from '@/services/signalRService';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteConversation = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      // Clear messages from UI first
      setMessages([]);
      setMediaGalleryItems([]);
      
      // Clear messages from storage for the selected user
      const selectedUserId = signalRService.currentSelectedUserId;
      if (selectedUserId) {
        // Fix: Use clearAllChatHistory instead of clearChatHistory
        signalRService.clearAllChatHistory();
      }
      
      // Show success message
      toast.success('Conversation deleted');
      
      // Close dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
      setIsDeleteDialogOpen(false);
    }
  };
  
  const cancelDeleteConversation = () => {
    // Simply close the dialog without any other actions
    setIsDeleteDialogOpen(false);
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteConversation,
    confirmDeleteConversation,
    cancelDeleteConversation
  };
};
