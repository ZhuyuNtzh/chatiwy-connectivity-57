
import { useState, useRef } from 'react';

export const useScrollManagement = () => {
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(false);
  const isAtBottomRef = useRef(true);
  
  const updateScrollPosition = (isAtBottom: boolean) => {
    isAtBottomRef.current = isAtBottom;
  };

  return {
    autoScrollToBottom,
    setAutoScrollToBottom,
    isAtBottomRef,
    updateScrollPosition
  };
};
