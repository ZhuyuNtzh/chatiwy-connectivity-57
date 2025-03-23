
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useConversationManagement = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletionInProgress, setIsDeletionInProgress] = useState(false);

  const deleteConversation = () => {
    console.log('Delete conversation initiated');
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteConversation = (
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setMediaGalleryItems: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    console.log('Confirming conversation deletion...');
    try {
      // Start the deletion process
      setIsDeletionInProgress(true);
      
      // Clear the messages and media
      console.log('Clearing messages and media items');
      setMessages([]);
      setMediaGalleryItems([]);
      
      // Show success notification
      console.log('Deletion completed, showing toast');
      toast.success('Conversation deleted');
      
      // Complete the process and close the dialog
      console.log('Closing delete dialog');
      setIsDeletionInProgress(false);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error during conversation deletion:', error);
      toast.error('Failed to delete conversation. Please try again.');
      setIsDeletionInProgress(false);
    }
  };
  
  const cancelDeleteConversation = () => {
    console.log('Canceling conversation deletion');
    try {
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error canceling delete dialog:', error);
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
