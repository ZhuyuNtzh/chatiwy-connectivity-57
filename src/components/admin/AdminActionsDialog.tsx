
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Ban, Crown, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminActions } from "@/hooks/useAdminActions";

interface AdminActionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: number; username: string } | null;
}

const AdminActionsDialog: React.FC<AdminActionsDialogProps> = ({
  isOpen,
  onOpenChange,
  user
}) => {
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [banReason, setBanReason] = useState<string>("");
  const [vipDuration, setVipDuration] = useState<"monthly" | "yearly">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { kickUser, banUser, upgradeToVIP } = useAdminActions();
  
  const resetForm = () => {
    setSelectedAction("");
    setBanReason("");
    setVipDuration("monthly");
    setIsSubmitting(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };
  
  const handleAction = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      switch (selectedAction) {
        case "kick":
          await kickUser(user.id, user.username);
          break;
        case "ban":
          if (!banReason.trim()) {
            toast.error("Please provide a reason for the ban");
            setIsSubmitting(false);
            return;
          }
          await banUser(user.id, user.username, banReason);
          break;
        case "vip":
          await upgradeToVIP(user.id, user.username, vipDuration);
          break;
        default:
          toast.error("Please select an action");
          setIsSubmitting(false);
          return;
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error executing admin action:", error);
      toast.error("Failed to execute action. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admin Action</DialogTitle>
          <DialogDescription>
            {user ? `Take administrative action on user ${user.username}` : "Please select a user"}
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="action">Select Action</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kick">
                      <div className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                        <span>Kick User (24 hours)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ban">
                      <div className="flex items-center">
                        <Ban className="mr-2 h-4 w-4 text-red-500" />
                        <span>Ban User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vip">
                      <div className="flex items-center">
                        <Crown className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Upgrade to VIP</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedAction === "ban" && (
                <div className="grid gap-2">
                  <Label htmlFor="reason">Ban Reason</Label>
                  <Textarea 
                    id="reason"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Please provide a reason for the ban"
                    rows={3}
                  />
                </div>
              )}
              
              {selectedAction === "vip" && (
                <div className="grid gap-2">
                  <Label>VIP Duration</Label>
                  <RadioGroup value={vipDuration} onValueChange={(value) => setVipDuration(value as "monthly" | "yearly")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">1 Month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly">1 Year</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleAction}
                disabled={isSubmitting || !selectedAction || (selectedAction === "ban" && !banReason.trim())}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminActionsDialog;
