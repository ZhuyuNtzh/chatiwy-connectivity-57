
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

      // We'll use setTimeout to move the expensive operation off the main thread
      setTimeout(() => {
        try {
          // Break down the clearing into smaller chunks to prevent UI freeze
          const localStorageKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('chat_') || key.startsWith('history_')
          );
          
          // Remove keys in batches of 5
          for (let i = 0; i < localStorageKeys.length; i += 5) {
            const batch = localStorageKeys.slice(i, i + 5);
            batch.forEach(key => localStorage.removeItem(key));
          }
          
          toast.success('Conversation deleted successfully');
        } catch (error) {
          console.error('Error in background deletion process:', error);
          // We don't show an error here as the UI is already cleared
        } finally {
          setIsDeleting(false);
        }
      }, 100);
      
      // Set dialog state immediately for better UX
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error starting deletion process:', error);
      toast.error('Failed to delete conversation');
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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
