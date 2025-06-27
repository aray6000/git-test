
export interface UserStats {
  totalPastes: number;
  publicPastes: number;
  privatePastes: number;
  totalViews: number;
  followers: number;
  following: number;
}

export const updateUserStats = (userId: string): UserStats => {
  if (typeof window === 'undefined') {
    return {
      totalPastes: 0,
      publicPastes: 0,
      privatePastes: 0,
      totalViews: 0,
      followers: 0,
      following: 0
    };
  }

  // Get user's actual pastes
  const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
  const userPastes = allPastes.filter((paste: any) => paste.userId === userId);

  // Calculate real stats
  const totalPastes = userPastes.length;
  const publicPastes = userPastes.filter((paste: any) => !paste.password).length;
  const privatePastes = userPastes.filter((paste: any) => paste.password).length;
  const totalViews = userPastes.reduce((sum: number, paste: any) => sum + (paste.views || 0), 0);

  // Get stored social stats
  const userStatsKey = `user-stats-${userId}`;
  const storedStats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');

  const updatedStats: UserStats = {
    totalPastes,
    publicPastes,
    privatePastes,
    totalViews,
    followers: storedStats.followers || 0,
    following: storedStats.following || 0
  };

  // Save updated stats
  try {
    localStorage.setItem(userStatsKey, JSON.stringify({
      ...updatedStats,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }

  return updatedStats;
};

export const getAllUsersStats = () => {
  if (typeof window === 'undefined') return [];

  const allUsers = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
  return allUsers.map((user: any) => ({
    userId: user.id,
    username: user.username,
    ...updateUserStats(user.id)
  }));
};

export const getTotalSiteStats = () => {
  if (typeof window === 'undefined') return {
    totalUsers: 0,
    totalPastes: 0,
    totalViews: 0,
    totalPublicPastes: 0
  };

  const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
  const allUsers = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');

  return {
    totalUsers: allUsers.filter((user: any) => !user.isGuest).length,
    totalPastes: allPastes.length,
    totalViews: allPastes.reduce((sum: number, paste: any) => sum + (paste.views || 0), 0),
    totalPublicPastes: allPastes.filter((paste: any) => !paste.password).length
  };
};

// Function to trigger stats update across the app
export const triggerStatsUpdate = (userId?: string) => {
  if (userId) {
    updateUserStats(userId);
  }
  
  // Dispatch custom event for components to listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('stats-updated', { 
      detail: { userId, timestamp: Date.now() }
    }));
  }
};

// Real-time stats updater - call this when pastes are created/viewed
export const updateRealTimeStats = () => {
  if (typeof window === 'undefined') return;
  
  // Get all users and update their stats
  const allUsers = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
  allUsers.forEach((user: any) => {
    if (!user.isGuest) {
      updateUserStats(user.id);
    }
  });
  
  // Trigger global update event
  window.dispatchEvent(new CustomEvent('global-stats-updated', { 
    detail: { timestamp: Date.now() }
  }));
};
