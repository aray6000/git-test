
// Database repair and maintenance utilities
import { UserDatabaseManager } from './database';
import { initializeUserDatabase, saveUserDatabase, getUserDatabase } from './auth';

export class DatabaseRepairService {
  
  // Comprehensive database repair
  static async repairAllDatabases(): Promise<{
    success: boolean;
    message: string;
    repairs: string[];
    stats: any;
  }> {
    const repairs: string[] = [];
    
    try {
      // Initialize databases
      initializeUserDatabase();
      
      // Repair main user database
      const userRepair = UserDatabaseManager.repairDatabase();
      if (userRepair.success) {
        repairs.push(...userRepair.repairs);
      }
      
      // Clean up orphaned data
      this.cleanupOrphanedData(repairs);
      
      // Initialize missing user stats
      this.initializeMissingUserStats(repairs);
      
      // Sync legacy data
      this.syncLegacyData(repairs);
      
      // Get final stats
      const stats = UserDatabaseManager.getDatabaseSize();
      
      return {
        success: true,
        message: `Database repair completed. ${repairs.length} issues fixed.`,
        repairs,
        stats
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Repair failed: ${error}`,
        repairs,
        stats: null
      };
    }
  }
  
  // Clean up orphaned data
  private static cleanupOrphanedData(repairs: string[]): void {
    try {
      const database = getUserDatabase();
      const userIds = new Set(database.users.map(u => u.id));
      
      // Remove stats for deleted users
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user-stats-')) {
          const userId = key.replace('user-stats-', '');
          if (!userIds.has(userId)) {
            localStorage.removeItem(key);
            repairs.push(`Removed orphaned stats for user ${userId}`);
          }
        }
        
        // Clean up other user-related data
        if (key.startsWith('user-cache-') || key.startsWith('user-profile-')) {
          const userId = key.split('-').pop();
          if (userId && !userIds.has(userId)) {
            localStorage.removeItem(key);
            repairs.push(`Removed orphaned cache for user ${userId}`);
          }
        }
      });
      
    } catch (error) {
      console.error('Error cleaning up orphaned data:', error);
    }
  }
  
  // Initialize missing user stats
  private static initializeMissingUserStats(repairs: string[]): void {
    try {
      const database = getUserDatabase();
      
      database.users.forEach(user => {
        const userStatsKey = `user-stats-${user.id}`;
        if (!localStorage.getItem(userStatsKey)) {
          const initialStats = {
            totalPastes: 0,
            publicPastes: 0,
            privatePastes: 0,
            totalViews: 0,
            followers: 0,
            following: 0,
            reputation: 0
          };
          localStorage.setItem(userStatsKey, JSON.stringify(initialStats));
          repairs.push(`Initialized stats for user ${user.username}`);
        }
      });
      
    } catch (error) {
      console.error('Error initializing user stats:', error);
    }
  }
  
  // Sync legacy data
  private static syncLegacyData(repairs: string[]): void {
    try {
      const database = getUserDatabase();
      
      // Sync with legacy users storage
      const legacyUsers = localStorage.getItem('crazy-paste-users');
      if (legacyUsers) {
        try {
          const parsed = JSON.parse(legacyUsers);
          if (Array.isArray(parsed) && parsed.length !== database.users.length) {
            localStorage.setItem('crazy-paste-users', JSON.stringify(database.users));
            repairs.push('Synced legacy users storage');
          }
        } catch (error) {
          localStorage.setItem('crazy-paste-users', JSON.stringify(database.users));
          repairs.push('Fixed corrupted legacy users storage');
        }
      }
      
    } catch (error) {
      console.error('Error syncing legacy data:', error);
    }
  }
  
  // Reset all databases (for testing)
  static resetAllDatabases(): { success: boolean; message: string } {
    try {
      // Clear all user-related storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('crazy-paste-') ||
          key.startsWith('user-stats-') ||
          key.startsWith('user-cache-') ||
          key.startsWith('user-profile-')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reinitialize databases
      initializeUserDatabase();
      
      return {
        success: true,
        message: `Reset complete. Removed ${keysToRemove.length} storage items.`
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Reset failed: ${error}`
      };
    }
  }
}
