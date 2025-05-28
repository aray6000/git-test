
import { useState, useEffect } from 'react';
import { getUserStats } from '@/lib/auth';

export function useUserStats(userId: string | null) {
  const [stats, setStats] = useState({
    totalPastes: 0,
    publicPastes: 0,
    privatePastes: 0,
    totalViews: 0,
    followers: 0,
    following: 0,
    reputation: 0
  });

  const refreshStats = () => {
    if (userId) {
      const currentStats = getUserStats(userId);
      setStats(currentStats);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [userId]);

  return { stats, refreshStats };
}
