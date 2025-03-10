
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Send, Image, Mic, X, MoreVertical, Flag, Ban, Smile, User, Eye, EyeOff
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';
import { toast } from "sonner";

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍',
  '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌'
];

const reportReasons = [
  { id: 'underage', label: 'Underage User: The user appears to be below the required age (18+).' },
  { id: 'harassment', label: 'Harassment/Hate Speech: The user is engaging in abusive, discriminatory, or hateful language.' },
  { id: 'illegal', label: 'Illegal Activity: The user is discussing or promoting illegal actions.' },
  { id: 'personal_info', label: 'Sharing Personal Information and nudity: The user is disclosing sensitive personal details or photos.' },
  { id: 'other', label: 'Other' }
];

interface ChatWindowProps {
  user: {
    id: number;
    username: string;
    gender: string;
    age: number;
    location: string;
    interests: string[];
    isOnline: boolean;
  };
  countryFlags: Record<string, string>;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, countryFlags, onClose }) => {
  const { userRole } = useUser();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const [otherReportReason, setOtherReportReason] = useState('');
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<number[]>([]);
  const [isBlockedUsersDialogOpen, setIsBlockedUsersDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxChars = userRole === 'vip' ? 200 : 140;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    
    // Don't automatically send a welcome message - wait for user to initiate
    
    return () => {
      // Cleanup
    };
  }, [user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    if (signalRService.isUserBlocked(user.id)) {
      toast.error(`You have blocked ${user.username} and cannot send messages.`);
      return;
    }
    
    signalRService.sendMessage(user.id, message.trim());
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleAddEmoji = (emoji: string) => {
    if (message.length + emoji.length <= maxChars) {
      setMessage(prev => prev + emoji);
    }
  };
  
  const handleBlockUser = () => {
    setIsBlockDialogOpen(true);
    setShowOptions(false);
  };
  
  const confirmBlockUser = () => {
    console.log('Blocking user', user.username);
    signalRService.blockUser(user.id);
    setBlockedUsers(prev => [...prev, user.id]);
    toast.success(`${user.username} has been blocked.`);
    setIsBlockDialogOpen(false);
  };
  
  const handleUnblockUser = (userId: number, username: string) => {
    signalRService.unblockUser(userId);
    setBlockedUsers(prev => prev.filter(id => id !== userId));
    toast.success(`${username} has been unblocked.`);
  };
  
  const handleReportUser = () => {
    setIsReportDialogOpen(true);
    setShowOptions(false);
  };
  
  const handleSubmitReport = () => {
    if (selectedReportReason === 'other' && !otherReportReason.trim()) {
      toast.error('Please provide details for your report');
      return;
    }
    
    const reason = selectedReportReason === 'other' 
      ? otherReportReason 
      : reportReasons.find(r => r.id === selectedReportReason)?.label || '';
    
    console.log('Reporting user', user.username, 'for', reason);
    toast.success(`Report submitted for ${user.username}`);
    setIsReportDialogOpen(false);
    setSelectedReportReason('');
    setOtherReportReason('');
  };
  
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
        setIsImageDialogOpen(true);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };
  
  const handleSendImage = () => {
    if (imagePreview) {
      signalRService.sendImage(user.id, imagePreview, true);
      setIsImageDialogOpen(false);
      setImagePreview(null);
    }
  };
  
  const toggleImageBlur = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isBlurred: !msg.isBlurred } : msg
    ));
  };

  const showBlockedUsersList = () => {
    setIsBlockedUsersDialogOpen(true);
    setShowOptions(false);
  };
  
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full w-full border border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-start">
          <div className="mr-3 flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
            <User className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{user.username}</h3>
              <span className="text-xs text-gray-500">
                {user.gender}, {user.age}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              {countryFlags[user.location] && (
                <img 
                  src={countryFlags[user.location]}
                  alt={`${user.location} flag`}
                  className="w-4 h-3 mr-1 object-cover"
                />
              )}
              <span>{user.location}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={showOptions} onOpenChange={setShowOptions}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleBlockUser}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Block user
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                  onClick={handleReportUser}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report user
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={showBlockedUsersList}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Blocked users
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'You' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {msg.isImage ? (
                  <div className="relative">
                    <img 
                      src={msg.imageUrl} 
                      alt="Shared image" 
                      className={`max-w-full rounded ${msg.isBlurred ? 'blur-md' : ''}`}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => toggleImageBlur(msg.id)}
                    >
                      {msg.isBlurred ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                      {msg.isBlurred ? 'Reveal' : 'Blur'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
                <div className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start" alignOffset={-40}>
              <div className="grid grid-cols-8 gap-1">
                {commonEmojis.map((emoji, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleAddEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 shrink-0"
            onClick={handleImageClick}
          >
            <Image className="h-5 w-5" />
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 shrink-0"
            disabled={userRole !== 'vip'}
            title={userRole !== 'vip' ? "VIP feature" : "Voice message"}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <div className="relative flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="pr-16"
              maxLength={maxChars}
              disabled={signalRService.isUserBlocked(user.id)}
            />
            <div className="absolute right-2 bottom-1 text-xs text-gray-400">
              {message.length}/{maxChars}
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || signalRService.isUserBlocked(user.id)}
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
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
                className="w-full h-auto max-h-80 object-contain rounded-md blur-md"
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
    </div>
  );
};

export default ChatWindow;
