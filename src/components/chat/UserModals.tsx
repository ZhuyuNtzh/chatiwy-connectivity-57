
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from 'lucide-react';

interface UserModalsProps {
  user: {
    id: number;
    username: string;
  };
  isBlockDialogOpen: boolean;
  setIsBlockDialogOpen: (open: boolean) => void;
  confirmBlockUser: () => void;
  isReportDialogOpen: boolean;
  setIsReportDialogOpen: (open: boolean) => void;
  selectedReportReason: string;
  setSelectedReportReason: (reason: string) => void;
  otherReportReason: string;
  setOtherReportReason: (reason: string) => void;
  handleSubmitReport: () => void;
  isImageDialogOpen: boolean;
  setIsImageDialogOpen: (open: boolean) => void;
  imagePreview: string | null;
  handleSendImage: () => void;
  isBlockedUsersDialogOpen: boolean;
  setIsBlockedUsersDialogOpen: (open: boolean) => void;
  blockedUsers: number[];
  handleUnblockUser: (userId: number, username: string) => void;
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  isKickDialogOpen?: boolean;
  setIsKickDialogOpen?: (open: boolean) => void;
  confirmKickUser?: () => void;
  isBanDialogOpen?: boolean;
  setIsBanDialogOpen?: (open: boolean) => void;
  confirmBanUser?: () => void;
}

const reportReasons = [
  { id: 'underage', label: 'Underage User: The user appears to be below the required age (18+).' },
  { id: 'harassment', label: 'Harassment/Hate Speech: The user is engaging in abusive, discriminatory, or hateful language.' },
  { id: 'illegal', label: 'Illegal Activity: The user is discussing or promoting illegal actions.' },
  { id: 'personal_info', label: 'Sharing Personal Information and nudity: The user is disclosing sensitive personal details or photos.' },
  { id: 'other', label: 'Other' }
];

const UserModals: React.FC<UserModalsProps> = ({
  user,
  isBlockDialogOpen,
  setIsBlockDialogOpen,
  confirmBlockUser,
  isReportDialogOpen,
  setIsReportDialogOpen,
  selectedReportReason,
  setSelectedReportReason,
  otherReportReason,
  setOtherReportReason,
  handleSubmitReport,
  isImageDialogOpen,
  setIsImageDialogOpen,
  imagePreview,
  handleSendImage,
  isBlockedUsersDialogOpen,
  setIsBlockedUsersDialogOpen,
  blockedUsers,
  handleUnblockUser,
  previewImage,
  setPreviewImage,
  isKickDialogOpen,
  setIsKickDialogOpen,
  confirmKickUser,
  isBanDialogOpen,
  setIsBanDialogOpen,
  confirmBanUser
}) => {
  return (
    <>
      {/* Block User Confirmation Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {user.username}? You won't be able to send or receive messages from this user.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>No</Button>
            <Button variant="destructive" onClick={confirmBlockUser}>Yes</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Report User Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report User: {user.username}</DialogTitle>
            <DialogDescription>
              Please select a reason for reporting this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <RadioGroup value={selectedReportReason} onValueChange={setSelectedReportReason}>
              {reportReasons.map((reason) => (
                <div key={reason.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="text-sm font-normal leading-tight">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {selectedReportReason === 'other' && (
              <Textarea 
                placeholder="Please describe the issue (100 characters max)" 
                maxLength={100}
                value={otherReportReason}
                onChange={(e) => setOtherReportReason(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitReport}
              disabled={!selectedReportReason || (selectedReportReason === 'other' && !otherReportReason.trim())}
            >
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Image Send Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Image</DialogTitle>
            <DialogDescription>
              Your image will be sent with a blur effect. Recipients can choose to reveal it.
            </DialogDescription>
          </DialogHeader>
          
          {imagePreview && (
            <div className="mt-4 relative">
              <img 
                src={imagePreview} 
                alt="Selected image preview" 
                className="w-full h-auto max-h-80 object-contain rounded-md blur-xl"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendImage}>Send Image</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Blocked Users List Dialog */}
      <Dialog open={isBlockedUsersDialogOpen} onOpenChange={setIsBlockedUsersDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blocked Users</DialogTitle>
            <DialogDescription>
              Users you have blocked can't send you messages
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {blockedUsers.length > 0 ? (
              <div className="space-y-2">
                {blockedUsers.map((userId) => {
                  const blockedUser = userId === user.id ? user : { id: userId, username: `User ${userId}` };
                  return (
                    <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>{blockedUser.username}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleUnblockUser(userId, blockedUser.username)}
                      >
                        Unblock
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No blocked users</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Full-size Image Preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white z-10"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Full size preview" 
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Kick User Dialog */}
      {isKickDialogOpen && setIsKickDialogOpen && confirmKickUser && (
        <Dialog open={isKickDialogOpen} onOpenChange={setIsKickDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kick User</DialogTitle>
              <DialogDescription>
                Are you sure you want to kick {user.username} from the chat? They will be disconnected immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsKickDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmKickUser}>Kick User</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Ban User Dialog */}
      {isBanDialogOpen && setIsBanDialogOpen && confirmBanUser && (
        <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Are you sure you want to ban {user.username}? This will permanently prevent them from using the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmBanUser}>Ban User</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserModals;
