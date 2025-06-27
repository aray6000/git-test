
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { FiInfo, FiUpload, FiClock, FiLock, FiShield } from 'react-icons/fi';

export const RoleFeaturesDisplay: React.FC = () => {
  const { user, getRoleFeatures } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only render on client side after hydration
  if (!isClient) return null;
  
  if (!user) return null;
  
  const features = getRoleFeatures();
  
  if (!features) return null;
  
  return (
    <Card className="bg-background/30 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FiInfo className="w-4 h-4" />
          Your Role Features
          <RoleBadge role={user.role} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FiUpload className="w-3 h-3 text-primary" />
            <span>Max Size: {features.maxPasteSize === -1 ? 'Unlimited' : `${features.maxPasteSize}KB`}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-3 h-3 text-secondary" />
            <span>Daily Limit: {features.maxPastesPerDay === -1 ? 'Unlimited' : features.maxPastesPerDay}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiLock className="w-3 h-3 text-accent" />
            <span>Private: {features.canCreatePrivatePastes ? '✓' : '✗'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiShield className="w-3 h-3 text-yellow-500" />
            <span>Custom Expiry: {features.canSetCustomExpiration ? '✓' : '✗'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
