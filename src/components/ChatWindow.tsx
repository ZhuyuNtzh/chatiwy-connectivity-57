import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, MoreVertical, Flag, Ban } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import type { ChatMessage } from '../services/signalR/types';
import { toast } from "sonner";

// Import refactored components
import MessageItem from './chat/MessageItem';
import MessageInput from './chat/MessageInput';
import UserInfo from './chat/UserInfo';
import UserModals from './chat/UserModals';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxChars = userRole === 'vip' ? 200 : 140;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.senderId === user.id || msg.senderId === 0) {
        setMessages(prev => [...prev, msg]);
      }
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    
    // Load existing messages for this user
    const existingMessages = signalRService.getChatHistory(user.id);
    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages);
    }
    
    // Check if this user is already blocked
    if (signalRService.isUserBlocked(user.id)) {
      setBlockedUsers(prev => [...prev, user.id]);
    }
    
    return () => {
      // Cleanup
    };
  }, [user.id]);
  
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
  
  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const showBlockedUsersList = () => {
    // Get the current blocked users from the service
    const blockedIds = signalRService.getBlockedUsers();
    setBlockedUsers(blockedIds);
    setIsBlockedUsersDialogOpen(true);
    setShowOptions(false);
  };
  
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 h-full w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        <UserInfo user={user} countryFlags={countryFlags} />
        
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
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <MessageItem 
                key={msg.id}
                message={msg}
                toggleImageBlur={toggleImageBlur}
                openImagePreview={openImagePreview}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <MessageInput 
          message={message}
          setMessage={setMessage}
          maxChars={maxChars}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          handleAddEmoji={handleAddEmoji}
          handleImageClick={handleImageClick}
          isUserBlocked={signalRService.isUserBlocked(user.id)}
          isVipUser={userRole === 'vip'}
          fileInputRef={fileInputRef}
        />
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
      
      <UserModals 
        user={user}
        isBlockDialogOpen={isBlockDialogOpen}
        setIsBlockDialogOpen={setIsBlockDialogOpen}
        confirmBlockUser={confirmBlockUser}
        isReportDialogOpen={isReportDialogOpen}
        setIsReportDialogOpen={setIsReportDialogOpen}
        selectedReportReason={selectedReportReason}
        setSelectedReportReason={setSelectedReportReason}
        otherReportReason={otherReportReason}
        setOtherReportReason={setOtherReportReason}
        handleSubmitReport={handleSubmitReport}
        isImageDialogOpen={isImageDialogOpen}
        setIsImageDialogOpen={setIsImageDialogOpen}
        imagePreview={imagePreview}
        handleSendImage={handleSendImage}
        isBlockedUsersDialogOpen={isBlockedUsersDialogOpen}
        setIsBlockedUsersDialogOpen={setIsBlockedUsersDialogOpen}
        blockedUsers={blockedUsers}
        handleUnblockUser={handleUnblockUser}
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
      />
    </div>
  );
};

export default ChatWindow;
