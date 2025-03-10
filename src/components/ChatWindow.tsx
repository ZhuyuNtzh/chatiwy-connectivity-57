import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Send, Image, Mic, X, MoreVertical, Flag, Ban, Smile, User
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { signalRService } from '../services/signalRService';
import { ChatMessage } from '../services/signalR/types';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxChars = userRole === 'vip' ? 200 : 140;
  
  useEffect(() => {
    const handleNewMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    };
    
    signalRService.onMessageReceived(handleNewMessage);
    
    setTimeout(() => {
      signalRService.simulateReceiveMessage(
        user.id,
        user.username,
        `Hi there! Nice to meet you. I'm from ${user.location} and I love ${user.interests.join(', ')}. How are you today?`,
        false,
        ""
      );
    }, 1000);
    
    return () => {
    };
  }, [user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
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
    console.log('Blocking user', user.username);
    setShowOptions(false);
  };
  
  const handleReportUser = () => {
    console.log('Reporting user', user.username);
    setShowOptions(false);
  };
  
  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[500px] max-w-xl w-full border border-gray-200 dark:border-gray-700">
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
                  <img 
                    src={msg.imageUrl} 
                    alt="Shared image" 
                    className="max-w-full rounded"
                  />
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
          
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0">
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
            />
            <div className="absolute right-2 bottom-1 text-xs text-gray-400">
              {message.length}/{maxChars}
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim()}
            className="h-9 w-9 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
