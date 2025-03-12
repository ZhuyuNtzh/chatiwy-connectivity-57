
import React, { useState } from 'react';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';

interface ChatActionsProps {
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
}

const ChatActions: React.FC<ChatActionsProps> = ({
  message,
  setMessage,
  maxChars,
  handleSendMessage,
  handleKeyDown,
  handleAddEmoji,
  handleImageClick,
  isUserBlocked,
  isVipUser,
  fileInputRef
}) => {
  const { isDarkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const startRecording = async () => {
    if (!isVipUser) {
      toast({
        title: "VIP Feature",
        description: "Voice messages are only available for VIP users",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setAudioChunks([]);
      setMediaRecorder(recorder);
      
      recorder.addEventListener('dataavailable', (e) => {
        setAudioChunks((chunks) => [...chunks, e.data]);
      });
      
      recorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Recording voice message...",
      });
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (!mediaRecorder) return;
    
    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Send the audio message (implementation would depend on your chat service)
      // For now, we'll just add a message indicating a voice message was sent
      setMessage(`[Voice Message] (${new Date().toLocaleTimeString()})`);
      setTimeout(() => {
        handleSendMessage();
        setMessage('');
      }, 100);
      
      // Clean up the media stream
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    });
    
    mediaRecorder.stop();
    setIsRecording(false);
    setMediaRecorder(null);
  };
  
  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      {isRecording ? (
        <div className={`mb-3 p-2 rounded-md flex items-center justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
            <span>Recording voice message...</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={stopRecording}
            className="flex items-center gap-1"
          >
            <StopCircle size={16} />
            Stop
          </Button>
        </div>
      ) : null}
      
      <MessageInput 
        message={message}
        setMessage={setMessage}
        maxChars={maxChars}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        handleAddEmoji={handleAddEmoji}
        handleImageClick={handleImageClick}
        isUserBlocked={isUserBlocked}
        isVipUser={isVipUser}
        fileInputRef={fileInputRef}
        onMicClick={startRecording}
        isRecording={isRecording}
      />
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={() => {}} // This will be handled by the parent component
      />
    </div>
  );
};

export default ChatActions;
