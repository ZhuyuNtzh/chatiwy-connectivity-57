
import { useState, useRef, useEffect } from 'react';

export const useSidebarState = () => {
  // Default to open on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth <= 768);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Set sidebar open by default on mobile devices
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setIsSidebarOpen(true);
      }
    };

    // Call once to initialize
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
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
    // Always close the sidebar when this is called, regardless of screen size
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
