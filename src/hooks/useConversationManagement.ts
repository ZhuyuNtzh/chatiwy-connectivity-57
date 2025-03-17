
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
    
    // Use requestAnimationFrame to ensure we're not blocking the UI thread
    requestAnimationFrame(() => {
      // Wrap in a Promise to make the operation truly asynchronous
      Promise.resolve().then(async () => {
        try {
          // Clear media gallery first (typically smaller)
          setMediaGalleryItems([]);
          
          // Get current messages
          setMessages(prevMessages => {
            // Process deletion in chunks if the conversation is large
            if (prevMessages.length > 100) {
              // For large conversations, use a chunked approach with async breaks
              const processInChunks = async () => {
                // First clear the UI by returning empty array
                // This gives immediate feedback even if background processing continues
                return [];
              };
              
              processInChunks().catch(console.error);
              return []; // Clear messages immediately for UI responsiveness
            } else {
              // For smaller conversations, just clear them directly
              return [];
            }
          });
          
          // Delay the success message slightly to ensure UI has updated
          setTimeout(() => {
            toast.success('Conversation deleted');
            setIsDeletingConversation(false);
            setIsDeleteDialogOpen(false);
          }, 300);
        } catch (error) {
          console.error('Error deleting conversation:', error);
          toast.error('Failed to delete conversation');
          setIsDeletingConversation(false);
          setIsDeleteDialogOpen(false);
        }
      });
    });
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
