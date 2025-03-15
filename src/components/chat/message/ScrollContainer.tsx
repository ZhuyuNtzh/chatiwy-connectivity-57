
import React, { RefObject } from 'react';

interface ScrollContainerProps {
  children: React.ReactNode;
  scrollRef: RefObject<HTMLDivElement>;
  className?: string;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ 
  children, 
  scrollRef,
  className = ""
}) => {
  return (
    <div 
      ref={scrollRef} 
      className={`h-full overflow-y-auto p-4 space-y-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollContainer;
