import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useUserStats(userId?: string | null) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPastes: 0,
    publicPastes: 0,
    privatePastes: 0,
    totalViews: 0,
    followers: 0,
    following: 0
  });

  // Use provided userId or current user's ID
  const targetUserId = userId || user?.id;

  const getUserPastes = useCallback(() => {
    if (typeof window === 'undefined' || !targetUserId) return [];

    try {
      const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
      if (!Array.isArray(allPastes)) return [];

      return allPastes.filter((paste: any) => {
        // Check if paste belongs to target user
        return paste && paste.userId === targetUserId;
      });
    } catch (error) {
      console.error('Error parsing pastes from localStorage:', error);
      return [];
    }
  }, [targetUserId]);

  const calculateStats = useCallback(() => {
    if (!targetUserId) return {
      totalPastes: 0,
      publicPastes: 0,
      privatePastes: 0,
      totalViews: 0,
      followers: 0,
      following: 0,
    };

    // Get actual pastes for real calculation
    const userPastes = getUserPastes();
    const actualTotalPastes = userPastes.length;
    const actualPublicPastes = userPastes.filter(paste => !paste.password).length;
    const actualPrivatePastes = userPastes.filter(paste => paste.password).length;
    const actualTotalViews = userPastes.reduce((sum, paste) => sum + (paste.views || 0), 0);

    // Get stored stats for followers/following
    const userStatsKey = `user-stats-${targetUserId}`;
    let storedStats = {};
    try {
      storedStats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');
    } catch (error) {
      console.error('Error parsing user stats:', error);
      storedStats = {};
    }

    // Always use actual counts for paste-related stats, stored values for social stats
    const calculatedStats = {
      totalPastes: actualTotalPastes,
      publicPastes: actualPublicPastes,
      privatePastes: actualPrivatePastes,
      totalViews: actualTotalViews,
      followers: storedStats.followers || 0,
      following: storedStats.following || 0,
    };

    // Update stored stats with real values immediately
    try {
      const updatedStats = {
        ...storedStats,
        totalPastes: actualTotalPastes,
        publicPastes: actualPublicPastes,
        privatePastes: actualPrivatePastes,
        totalViews: actualTotalViews,
        followers: storedStats.followers || 0,
        following: storedStats.following || 0,
        lastCalculated: new Date().toISOString()
      };
      localStorage.setItem(userStatsKey, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }

    return calculatedStats;
  }, [targetUserId, getUserPastes]);

  const refreshStats = useCallback(() => {
    if (targetUserId) {
      setStats(calculateStats());
    }
  }, [targetUserId, calculateStats]);

  useEffect(() => {
    if (targetUserId) {
      setStats(calculateStats());
    } else {
      // Reset stats if no user
      setStats({
        totalPastes: 0,
        publicPastes: 0,
        privatePastes: 0,
        totalViews: 0,
        followers: 0,
        following: 0
      });
    }
  }, [targetUserId, calculateStats]);

  return { ...stats, refreshStats };
}