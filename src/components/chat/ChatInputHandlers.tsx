
import React from 'react';

interface ChatInputHandlersProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatInputHandlers: React.FC<ChatInputHandlersProps> = ({ 
  fileInputRef, 
  handleImageChange 
}) => {
  return (
    <input 
      type="file" 
      ref={fileInputRef}
      accept="image/*"
      className="hidden"
      onChange={handleImageChange}
    />
  );
};

export default ChatInputHandlers;
