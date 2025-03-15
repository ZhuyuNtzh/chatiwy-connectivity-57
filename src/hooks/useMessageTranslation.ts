
import { useState } from 'react';
import { toast } from "sonner";
import type { ChatMessage } from '@/services/signalR/types';

export const useMessageTranslation = (userRole: string) => {
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Helper function to simulate message translation
  const translateMessage = async (msg: ChatMessage): Promise<ChatMessage> => {
    try {
      // In a real app, you would call a translation API here
      // For demo, we'll simulate a translation
      const translatedContent = msg.content ? `[Translated: ${msg.content}]` : msg.content;
      
      return {
        ...msg,
        content: translatedContent,
        translated: true
      } as ChatMessage;
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate message');
      return msg;
    }
  };

  const toggleTranslation = () => {
    if (userRole !== 'vip') {
      toast.error('Translation is a VIP feature');
      return;
    }
    setIsTranslationEnabled(prev => !prev);
    toast.success(isTranslationEnabled ? 'Translation disabled' : 'Translation enabled');
  };

  return {
    isTranslationEnabled,
    setIsTranslationEnabled,
    selectedLanguage,
    setSelectedLanguage,
    translateMessage,
    toggleTranslation
  };
};
