
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Mic, Smile, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  maxChars: number;
  handleSendMessage: (e?: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleAddEmoji: (emoji: string) => void;
  handleImageClick: () => void;
  isUserBlocked: boolean;
  isVipUser: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleVoiceMessageClick?: () => void;
  sendVoiceMessage?: (audioUrl: string) => void;
  isAdmin?: boolean;
}

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
];

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  maxChars,
  handleSendMessage,
  handleKeyDown,
  handleAddEmoji,
  handleImageClick,
  isUserBlocked,
  isVipUser,
  fileInputRef,
  handleVoiceMessageClick,
  sendVoiceMessage,
  isAdmin = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    // Admin can always send voice messages
    if (!isVipUser && !isAdmin) {
      toast("Voice messages are a VIP feature");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingTime(0);
      setIsRecording(true);
      
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      });
      
      recorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (sendVoiceMessage) {
          sendVoiceMessage(audioUrl);
        }
        
        stream.getTracks().forEach(track => track.stop());
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      });
      
      recorder.start();
      
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone. Check permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // For admin users, we don't show character limit
  const showCharLimit = !isAdmin;
  
  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2 sticky bottom-0 bg-white dark:bg-gray-800 p-2 border-t border-gray-200 dark:border-gray-700">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 dark:bg-gray-800" align="start" alignOffset={-40} side="top">
          <div className="grid grid-cols-7 gap-1">
            {commonEmojis.map((emoji, i) => (
              <Button
                key={i}
                variant="ghost"
                className="h-10 w-10 p-0 text-lg"
                onClick={() => handleAddEmoji(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 shrink-0"
        onClick={handleImageClick}
      >
        <Image className="h-5 w-5" />
      </Button>
      
      {isRecording ? (
        <Button 
          type="button" 
          variant="destructive" 
          size="sm" 
          className="h-9 shrink-0 flex items-center gap-2"
          onClick={stopRecording}
        >
          <StopCircle className="h-5 w-5" />
          {formatTime(recordingTime)}
        </Button>
      ) : (
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 shrink-0"
          disabled={!isVipUser && !isAdmin || isUserBlocked}
          onClick={startRecording}
          title={!isVipUser && !isAdmin ? "VIP feature" : "Record voice message"}
        >
          <Mic className={`h-5 w-5 ${!isVipUser && !isAdmin ? "opacity-50" : ""}`} />
        </Button>
      )}
      
      <div className="relative flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(isAdmin ? e.target.value : e.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="pr-16 dark:bg-gray-700 dark:text-white"
          maxLength={isAdmin ? undefined : maxChars}
          disabled={isUserBlocked || isRecording}
          name="message"
        />
        {showCharLimit && (
          <div className="absolute right-2 bottom-1 text-xs text-gray-400">
            {message.length}/{maxChars}
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        size="icon" 
        disabled={(!message.trim() && !isRecording) || isUserBlocked}
        className="h-9 w-9 shrink-0"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default MessageInput;
