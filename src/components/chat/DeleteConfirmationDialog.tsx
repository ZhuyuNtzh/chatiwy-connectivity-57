
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Delete Conversation",
  description = "Are you sure you want to delete this entire conversation? This action cannot be undone.",
  isLoading = false
}) => {
  console.log('Rendering DeleteConfirmationDialog, isOpen:', isOpen, 'isLoading:', isLoading);
  
  const handleConfirm = () => {
    console.log('Delete confirmation button clicked');
    // Only proceed if not already in progress
    if (!isLoading) {
      onConfirm();
    }
  };
  
  const handleCancel = () => {
    console.log('Delete cancellation button clicked');
    // Only proceed if not already in progress
    if (!isLoading) {
      onCancel();
    }
  };
  
  const handleOpenChange = (newOpenState: boolean) => {
    console.log('Dialog open state changing from', isOpen, 'to', newOpenState);
    // Prevent closing the dialog if deletion is in progress
    if (isLoading) {
      console.log('Preventing dialog state change while loading');
      return;
    }
    
    if (!newOpenState && isOpen) {
      // If dialog is closing, call onCancel
      handleCancel();
    } else {
      onOpenChange(newOpenState);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isLoading}
            className="relative"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                Deleting...
              </>
            ) : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
