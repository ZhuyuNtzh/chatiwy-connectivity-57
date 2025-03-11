
import { useState, useRef } from 'react';

export const useSidebarState = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const toggleSidebar = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsSidebarOpen(prev => !prev);
  };
  
  const openSidebar = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsSidebarOpen(true);
  };
  
  const closeSidebar = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsSidebarOpen(false);
  };
  
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return {
    isSidebarOpen,
    sidebarRef,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    handleContentClick
  };
};
