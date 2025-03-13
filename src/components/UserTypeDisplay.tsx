
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/contexts/UserContext';
import { Shield, Crown, User } from 'lucide-react';

interface UserTypeDisplayProps {
  role: UserRole;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserTypeDisplay = ({ 
  role, 
  showIcon = true, 
  showLabel = true,
  size = 'md',
  className = ''
}: UserTypeDisplayProps) => {
  // Sizing classes based on size prop
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }[size];
  
  const badgeClass = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  }[size];
  
  // Role-specific content
  const roleConfig = {
    admin: {
      label: 'Admin',
      icon: <Shield className={iconSize} />,
      variant: 'admin' as const
    },
    moderator: {
      label: 'Moderator',
      icon: <Shield className={iconSize} />,
      variant: 'moderator' as const
    },
    vip: {
      label: 'VIP',
      icon: <Crown className={iconSize} />,
      variant: 'vip' as const
    },
    standard: {
      label: 'User',
      icon: <User className={iconSize} />,
      variant: 'standard' as const
    }
  };
  
  // Default to standard if role doesn't match
  const config = roleConfig[role] || roleConfig.standard;
  
  return (
    <Badge 
      variant={config.variant} 
      className={`${badgeClass} ${className}`}
    >
      {showIcon && (
        <span className="mr-1">{config.icon}</span>
      )}
      {showLabel && config.label}
    </Badge>
  );
};

export default UserTypeDisplay;
