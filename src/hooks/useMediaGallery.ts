
import { useState } from 'react';

export const useMediaGallery = () => {
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [mediaGalleryItems, setMediaGalleryItems] = useState<{
    type: 'image' | 'voice' | 'link';
    url: string;
    timestamp: Date;
  }[]>([]);

  const showMediaGallery = () => {
    setIsMediaGalleryOpen(true);
  };

  // Helper function to check if a message contains a link
  const isLinkMessage = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(content);
  };
  
  // Helper function to extract link from message
  const extractLink = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    return matches ? matches[0] : '';
  };

  return {
    isMediaGalleryOpen,
    setIsMediaGalleryOpen,
    mediaGalleryItems,
    setMediaGalleryItems,
    showMediaGallery,
    isLinkMessage,
    extractLink
  };
};
