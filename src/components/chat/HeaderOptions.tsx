
import React from 'react';
import { X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderOptionsProps {
  showOptions: boolean;
  onShowOptions: (show: boolean) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const HeaderOptions: React.FC<HeaderOptionsProps> = ({
  showOptions,
  onShowOptions,
  onClose,
  children
}) => {
  return (
    <div className="flex items-center space-x-1">
      <DropdownMenu open={showOptions} onOpenChange={onShowOptions}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        {children}
      </DropdownMenu>
      
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default HeaderOptions;
