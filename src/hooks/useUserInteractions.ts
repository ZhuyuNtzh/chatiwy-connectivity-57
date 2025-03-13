
import { useState } from 'react';
import { signalRService } from '@/services/signalRService';
import { toast } from "sonner";
import { useUser } from '@/contexts/UserContext';

export const useUserInteractions = (userId: number) => {
  const { userRole } = useUser();
  const [showOptions, setShowOptions] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [otherReportReason, setOtherReportReason] = useState('');
  const [blockedUsers, setBlockedUsers] = useState<number[]>([]);
  const [isBlockedUsersDialogOpen, setIsBlockedUsersDialogOpen] = useState(false);

  const handleBlockUser = () => {
    // Admin users cannot be blocked
    if (signalRService.isAdminUser(userId)) {
      toast.error(`You cannot block an admin.`);
      return;
    }
    
    setIsBlockDialogOpen(true);
    setShowOptions(false);
  };

  const confirmBlockUser = () => {
    signalRService.blockUser(userId);
    setBlockedUsers(prev => [...prev, userId]);
    toast.success(`User has been blocked.`);
    setIsBlockDialogOpen(false);
  };

  const handleUnblockUser = (userId: number, username: string) => {
    signalRService.unblockUser(userId);
    setBlockedUsers(prev => prev.filter(id => id !== userId));
    toast.success(`${username} has been unblocked.`);
  };

  const handleReportUser = () => {
    // Admin users cannot be reported
    if (signalRService.isAdminUser(userId)) {
      toast.error(`You cannot report an admin.`);
      return;
    }
    
    setIsReportDialogOpen(true);
    setShowOptions(false);
  };

  const handleSubmitReport = () => {
    if (selectedReportReason === 'other' && !otherReportReason.trim()) {
      toast.error('Please provide details for your report');
      return;
    }
    
    const reportReasons = [
      { id: 'underage', label: 'Underage User: The user appears to be below the required age (18+).' },
      { id: 'harassment', label: 'Harassment/Hate Speech: The user is engaging in abusive, discriminatory, or hateful language.' },
      { id: 'illegal', label: 'Illegal Activity: The user is discussing or promoting illegal actions.' },
      { id: 'personal_info', label: 'Sharing Personal Information and nudity: The user is disclosing sensitive personal details or photos.' },
      { id: 'other', label: 'Other' }
    ];
    
    const reason = selectedReportReason === 'other' 
      ? otherReportReason 
      : reportReasons.find(r => r.id === selectedReportReason)?.label || '';
    
    console.log('Reporting user for', reason);
    toast.success(`Report submitted successfully`);
    setIsReportDialogOpen(false);
    setSelectedReportReason('');
    setOtherReportReason('');
  };

  return {
    showOptions,
    setShowOptions,
    isBlockDialogOpen,
    setIsBlockDialogOpen,
    isReportDialogOpen,
    setIsReportDialogOpen,
    selectedReportReason,
    setSelectedReportReason,
    otherReportReason,
    setOtherReportReason,
    blockedUsers,
    setBlockedUsers,
    isBlockedUsersDialogOpen,
    setIsBlockedUsersDialogOpen,
    handleBlockUser,
    confirmBlockUser,
    handleUnblockUser,
    handleReportUser,
    handleSubmitReport
  };
};
