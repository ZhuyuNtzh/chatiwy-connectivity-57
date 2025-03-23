
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Ban, Bot, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/contexts/AdminContext";

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
  const [action, setAction] = useState<"kick" | "ban" | "vip" | null>(null);
  const [banReason, setBanReason] = useState("");
  const [vipDuration, setVipDuration] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const { kickUser, banUser, upgradeToVIP } = useAdmin();

  const handleActionSelect = (value: string) => {
    setAction(value as "kick" | "ban" | "vip");
  };

  const resetForm = () => {
    setAction(null);
    setBanReason("");
    setVipDuration("monthly");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleAction = async () => {
    if (!user || !action) return;

    setIsLoading(true);

    try {
      let success = false;
      let message = "";

      switch (action) {
        case "kick":
          success = await kickUser(user.id);
          message = success
            ? `${user.username} has been kicked for 24 hours`
            : "Failed to kick user";
          break;
        case "ban":
          if (!banReason.trim()) {
            toast.error("Ban reason is required");
            setIsLoading(false);
            return;
          }
          success = await banUser(user.id, banReason);
          message = success
            ? `${user.username} has been banned permanently`
            : "Failed to ban user";
          break;
        case "vip":
          success = await upgradeToVIP(user.id, vipDuration);
          message = success
            ? `${user.username} has been upgraded to VIP (${vipDuration})`
            : "Failed to upgrade user to VIP";
          break;
      }

      if (success) {
        toast.success(message);
        handleClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error("Error executing admin action:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const actionIcons = {
    kick: <Boot className="h-5 w-5 mr-2" />,
    ban: <Ban className="h-5 w-5 mr-2" />,
    vip: <Crown className="h-5 w-5 mr-2" />
  };

  const actionTitles = {
    kick: "Kick User",
    ban: "Ban User",
    vip: "Upgrade to VIP"
  };

  const actionDescriptions = {
    kick: "Temporarily remove the user from the platform for 24 hours",
    ban: "Permanently ban the user from the platform",
    vip: "Grant the user VIP status and benefits"
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Take Action on {user.username}
          </DialogTitle>
          <DialogDescription>
            Select the appropriate action to take
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Action</Label>
              <RadioGroup 
                value={action || ""} 
                onValueChange={handleActionSelect}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted">
                  <RadioGroupItem value="kick" id="kick" />
                  <Label htmlFor="kick" className="flex items-center cursor-pointer">
                    {actionIcons.kick}
                    <div>
                      <span className="font-medium">Kick User</span>
                      <p className="text-xs text-muted-foreground">Temporary 24-hour removal</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted">
                  <RadioGroupItem value="ban" id="ban" />
                  <Label htmlFor="ban" className="flex items-center cursor-pointer">
                    {actionIcons.ban}
                    <div>
                      <span className="font-medium">Ban User</span>
                      <p className="text-xs text-muted-foreground">Permanent account removal</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted">
                  <RadioGroupItem value="vip" id="vip" />
                  <Label htmlFor="vip" className="flex items-center cursor-pointer">
                    {actionIcons.vip}
                    <div>
                      <span className="font-medium">Upgrade to VIP</span>
                      <p className="text-xs text-muted-foreground">Grant premium benefits</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {action === "ban" && (
              <div className="space-y-2">
                <Label htmlFor="banReason">Ban Reason (Required)</Label>
                <Textarea
                  id="banReason"
                  placeholder="Enter reason for ban"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}

            {action === "vip" && (
              <div className="space-y-2">
                <Label>VIP Subscription Duration</Label>
                <RadioGroup 
                  value={vipDuration} 
                  onValueChange={(value) => setVipDuration(value as "monthly" | "yearly")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly">Yearly</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={isLoading || !action || (action === "ban" && !banReason.trim())}
          >
            {isLoading ? "Processing..." : "Confirm Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminActionsDialog;
