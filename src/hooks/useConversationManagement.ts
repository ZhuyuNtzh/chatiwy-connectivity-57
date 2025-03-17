
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

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
      
      // Clear UI immediately for better perceived performance
      setMessages([]);
      setMediaGalleryItems([]);

      // Use a completely different approach to avoid freezing:
      // 1. Create a Web Worker to handle deletion in a separate thread
      const workerCode = `
        self.onmessage = function(e) {
          // Get all localStorage keys
          const keys = Object.keys(localStorage).filter(key => 
            key.startsWith('chat_') || key.startsWith('history_') || 
            key.startsWith('unread')
          );
          
          // Process in small batches
          const BATCH_SIZE = 5;
          for (let i = 0; i < keys.length; i += BATCH_SIZE) {
            const batch = keys.slice(i, i + BATCH_SIZE);
            
            // Delete each key in the batch
            batch.forEach(key => {
              localStorage.removeItem(key);
            });
            
            // Report progress
            self.postMessage({ 
              progress: Math.min(100, Math.round((i + BATCH_SIZE) / keys.length * 100)),
              completedKeys: batch
            });
            
            // Small pause to prevent UI freeze
            if (i + BATCH_SIZE < keys.length) {
              // Allow other operations between batches
              setTimeout(() => {}, 0);
            }
          }
          
          self.postMessage({ done: true });
        };
      `;

      // Create blob URL for the worker
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      // Create and start the worker
      const worker = new Worker(workerUrl);
      
      worker.onmessage = (e) => {
        if (e.data.done) {
          // Cleanup when done
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          setIsDeleting(false);
          toast.success('Conversation deleted successfully');
        }
      };
      
      worker.onerror = (error) => {
        console.error('Worker error:', error);
        // Fallback to much simpler approach if worker fails
        setTimeout(() => {
          try {
            const keys = Object.keys(localStorage).filter(key => 
              key.startsWith('chat_') || key.startsWith('history_') || 
              key.startsWith('unread')
            );
            keys.forEach(key => localStorage.removeItem(key));
          } catch (err) {
            console.error('Error in fallback deletion:', err);
          }
          setIsDeleting(false);
        }, 10);
      };
      
      // Start the worker
      worker.postMessage('start');
      
      // Immediately close dialog for better UX
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
