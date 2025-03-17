
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';
import { signalRService } from '@/services/signalRService';

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
    
    // Immediately clear UI for responsiveness
    setMessages([]);
    setMediaGalleryItems([]);
    
    // Use a Web Worker to handle heavy deletion in background
    // if browser doesn't support workers, fall back to setTimeout
    setTimeout(() => {
      try {
        // Call the signalR service to properly clear the conversation from storage
        if (signalRService && signalRService.currentUserId) {
          const selectedUserId = signalRService.selectedUserId;
          if (selectedUserId) {
            signalRService.clearChatHistory(selectedUserId);
          }
        }
        
        // Success message after short delay to ensure UI has updated
        setTimeout(() => {
          toast.success('Conversation deleted');
          setIsDeletingConversation(false);
          setIsDeleteDialogOpen(false);
        }, 100);
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Failed to delete conversation');
        setIsDeletingConversation(false);
        setIsDeleteDialogOpen(false);
      }
    }, 50); // Small delay to ensure UI updates first
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
