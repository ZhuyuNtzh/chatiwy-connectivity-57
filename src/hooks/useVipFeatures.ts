
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export const useVipFeatures = () => {
  const [vipUpgradeUser, setVipUpgradeUser] = useState<{ id: number; username: string } | null>(null);
  const [isVipUpgradeDialogOpen, setIsVipUpgradeDialogOpen] = useState(false);

  // Set temporary VIP status for a user
  const setTempVipStatus = useCallback((userId: number, username: string) => {
    // Open the confirmation dialog
    setVipUpgradeUser({ id: userId, username });
    setIsVipUpgradeDialogOpen(true);
  }, []);

  // This is called after confirmation dialog is confirmed
  const confirmTempVipStatus = useCallback((userId: number, username: string, expiryDate: Date) => {
    // In a real app, this would update the database
    console.log(`User ${username} (ID: ${userId}) granted temporary VIP status until ${expiryDate.toLocaleString()}`);
    
    // Simulate updating the user's status
    localStorage.setItem(`tempVip_${userId}`, JSON.stringify({
      username,
      expiryDate: expiryDate.toISOString(),
    }));

    // Update the VIP status so it takes effect immediately
    localStorage.setItem(`vipStatus_${userId}`, JSON.stringify({
      username,
      isPermanent: false,
      expiryDate: expiryDate.toISOString(),
    }));

    toast.success(`${username} has been granted VIP status until ${expiryDate.toLocaleDateString()}`);
    
    // Close the dialog
    setIsVipUpgradeDialogOpen(false);
    setVipUpgradeUser(null);
  }, []);

  // Upgrade a user to VIP status
  const upgradeToVip = useCallback((userId: number, username: string, isPermanent: boolean, expiryDate?: Date) => {
    // In a real app, this would update the database
    if (isPermanent) {
      console.log(`User ${username} (ID: ${userId}) upgraded to permanent VIP status`);
      toast.success(`${username} has been granted permanent VIP status`);
    } else if (expiryDate) {
      console.log(`User ${username} (ID: ${userId}) upgraded to VIP status until ${expiryDate.toLocaleString()}`);
      toast.success(`${username} has been granted VIP status until ${expiryDate.toLocaleDateString()}`);
    }
    
    // Simulate updating the user's status
    localStorage.setItem(`vipStatus_${userId}`, JSON.stringify({
      username,
      isPermanent,
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
    }));
  }, []);

  return {
    setTempVipStatus,
    upgradeToVip,
    vipUpgradeUser,
    isVipUpgradeDialogOpen,
    setIsVipUpgradeDialogOpen,
    confirmTempVipStatus
  };
};
