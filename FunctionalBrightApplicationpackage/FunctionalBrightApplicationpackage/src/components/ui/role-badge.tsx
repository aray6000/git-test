import React from 'react';
import { Badge } from './badge';
import { UserRole, ROLE_FEATURES } from '@/lib/types';

interface RoleBadgeProps {
  role: UserRole | string;
  username?: string;
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  username,
  showIcon = true, 
  className = "" 
}) => {
  // Get role data with fallback for unknown roles
  const roleData = ROLE_FEATURES[role as UserRole] || {
    color: '#6b7280', // Default gray color
    icon: '👤', // Default user icon
    features: []
  };

  // Role-specific color mapping for common roles not in ROLE_FEATURES
  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'owner': return '#ff6b35';
      case 'admin': return '#dc2626';
      case 'moderator': return '#ea580c';
      case 'pro': return '#7c3aed';
      case 'premium': return '#db2777';
      case 'user': return '#059669';
      case 'guest': return '#6b7280';
      case 'banned': return '#991b1b';
      default: return roleData.color || '#6b7280';
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'owner': return '👑';
      case 'admin': return '🛡️';
      case 'moderator': return '🔨';
      case 'pro': return '⭐';
      case 'premium': return '💎';
      case 'user': return '👤';
      case 'guest': return '👋';
      case 'banned': return '🚫';
      default: return roleData.icon || '👤';
    }
  };

  const finalColor = getRoleColor(role);
  const finalIcon = getRoleIcon(role);

  return (
    <Badge 
      className={`${className} border-none text-white font-semibold text-xs`}
      style={{ 
        backgroundColor: finalColor,
        boxShadow: `0 0 10px ${finalColor}40`
      }}
    >
      {showIcon && <span className="mr-1">{finalIcon}</span>}
      {username ? `${username} (${role})` : role}
    </Badge>
  );
};