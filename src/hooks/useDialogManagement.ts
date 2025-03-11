
import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

export const useDialogManagement = () => {
  const { rulesAccepted, setRulesAccepted } = useUser();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(!rulesAccepted);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  
  const handleRulesAccepted = () => {
    setRulesAccepted(true);
    sessionStorage.setItem('rulesAccepted', 'true');
    setIsRulesModalOpen(false);
  };
  
  return {
    isRulesModalOpen,
    setIsRulesModalOpen,
    isLogoutDialogOpen,
    setIsLogoutDialogOpen,
    isHistoryDialogOpen,
    setIsHistoryDialogOpen,
    showInbox,
    setShowInbox,
    handleRulesAccepted
  };
};
