
import { User, UserDatabase } from './auth';

// Database backup and restore functions
export class UserDatabaseManager {
  
  // Export database to JSON
  static exportDatabase(): string {
    if (typeof window === 'undefined') return '{}';
    
    const database = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
    const userStats: Record<string, any> = {};
    
    // Include user stats in export
    database.users?.forEach((user: User) => {
      const statsKey = `user-stats-${user.id}`;
      const stats = localStorage.getItem(statsKey);
      if (stats) {
        userStats[user.id] = JSON.parse(stats);
      }
    });
    
    return JSON.stringify({
      database,
      userStats,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // Import database from JSON
  static importDatabase(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.database || !Array.isArray(data.database.users)) {
        return { success: false, message: 'Invalid database format' };
      }

      // Backup current database
      const currentDb = localStorage.getItem('crazy-paste-user-database');
      if (currentDb) {
        localStorage.setItem('crazy-paste-user-database-backup', currentDb);
      }

      // Import database
      localStorage.setItem('crazy-paste-user-database', JSON.stringify(data.database));
      
      // Import user stats
      if (data.userStats) {
        Object.entries(data.userStats).forEach(([userId, stats]) => {
          localStorage.setItem(`user-stats-${userId}`, JSON.stringify(stats));
        });
      }

      return { success: true, message: 'Database imported successfully' };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
  }

  // Clear all user data
  static clearDatabase(): { success: boolean; message: string } {
    try {
      // Backup before clearing
      const backup = this.exportDatabase();
      localStorage.setItem('crazy-paste-last-backup', backup);

      // Clear user database
      localStorage.removeItem('crazy-paste-user-database');
      localStorage.removeItem('crazy-paste-users');
      localStorage.removeItem('crazy-paste-current-user');

      // Clear all user stats
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user-stats-')) {
          localStorage.removeItem(key);
        }
      });

      return { success: true, message: 'Database cleared successfully' };
    } catch (error) {
      return { success: false, message: `Clear failed: ${error}` };
    }
  }

  // Get database size information
  static getDatabaseSize(): {
    totalSize: number;
    userDataSize: number;
    statsSize: number;
    userCount: number;
  } {
    let totalSize = 0;
    let userDataSize = 0;
    let statsSize = 0;
    let userCount = 0;

    if (typeof window === 'undefined') {
      return { totalSize: 0, userDataSize: 0, statsSize: 0, userCount: 0 };
    }

    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key) || '';
      const size = new Blob([value]).size;
      totalSize += size;

      if (key === 'crazy-paste-user-database' || key === 'crazy-paste-users') {
        userDataSize += size;
        if (key === 'crazy-paste-user-database') {
          try {
            const db = JSON.parse(value);
            userCount = db.users?.length || 0;
          } catch (e) {
            // Ignore parsing errors
          }
        }
      } else if (key.startsWith('user-stats-')) {
        statsSize += size;
      }
    });

    return { totalSize, userDataSize, statsSize, userCount };
  }

  // Validate database integrity
  static validateDatabase(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (typeof window === 'undefined') {
        return { isValid: false, errors: ['Browser environment required'], warnings: [] };
      }

      const dbString = localStorage.getItem('crazy-paste-user-database');
      if (!dbString) {
        return { isValid: false, errors: ['Database not found'], warnings: [] };
      }

      const database = JSON.parse(dbString);
      
      if (!database.users || !Array.isArray(database.users)) {
        errors.push('Invalid users array');
      }

      // Validate each user
      database.users?.forEach((user: any, index: number) => {
        if (!user.id) errors.push(`User ${index}: Missing ID`);
        if (!user.email) errors.push(`User ${index}: Missing email`);
        if (!user.username) errors.push(`User ${index}: Missing username`);
        if (!user.createdAt) warnings.push(`User ${index}: Missing creation date`);
        
        // Check for user stats
        const statsKey = `user-stats-${user.id}`;
        if (!localStorage.getItem(statsKey)) {
          warnings.push(`User ${user.username}: Missing stats data`);
        }
      });

      // Check for duplicate emails
      const emails = database.users?.map((u: any) => u.email) || [];
      const duplicateEmails = emails.filter((email: string, index: number) => emails.indexOf(email) !== index);
      if (duplicateEmails.length > 0) {
        errors.push(`Duplicate emails found: ${duplicateEmails.join(', ')}`);
      }

      // Check for duplicate usernames
      const usernames = database.users?.map((u: any) => u.username) || [];
      const duplicateUsernames = usernames.filter((username: string, index: number) => usernames.indexOf(username) !== index);
      if (duplicateUsernames.length > 0) {
        errors.push(`Duplicate usernames found: ${duplicateUsernames.join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Database validation failed: ${error}`],
        warnings: []
      };
    }
  }

  // Repair database issues
  static repairDatabase(): { success: boolean; message: string; repairs: string[] } {
    const repairs: string[] = [];
    
    try {
      const validation = this.validateDatabase();
      if (validation.isValid) {
        return { success: true, message: 'Database is already valid', repairs: [] };
      }

      const database = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
      
      // Fix missing or invalid user arrays
      if (!database.users || !Array.isArray(database.users)) {
        database.users = [];
        repairs.push('Fixed invalid users array');
      }

      // Remove duplicate users by email
      const seenEmails = new Set();
      const uniqueUsers = database.users.filter((user: any) => {
        if (seenEmails.has(user.email)) {
          repairs.push(`Removed duplicate user: ${user.email}`);
          return false;
        }
        seenEmails.add(user.email);
        return true;
      });

      database.users = uniqueUsers;

      // Fix missing required fields
      database.users.forEach((user: any, index: number) => {
        if (!user.id) {
          user.id = crypto.randomUUID();
          repairs.push(`Generated missing ID for user ${index}`);
        }
        if (!user.email) {
          user.email = `user${index}@temp.local`;
          repairs.push(`Generated missing email for user ${index}`);
        }
        if (!user.username) {
          user.username = `user${index}`;
          repairs.push(`Generated missing username for user ${index}`);
        }
        if (!user.password) {
          user.password = 'temp123';
          repairs.push(`Set temporary password for user ${user.username}`);
        }
        if (!user.createdAt) {
          user.createdAt = new Date().toISOString();
          repairs.push(`Added missing creation date for user ${user.username || index}`);
        }
        if (!user.updatedAt) {
          user.updatedAt = new Date().toISOString();
          repairs.push(`Added missing update date for user ${user.username || index}`);
        }
        if (user.isActive === undefined) {
          user.isActive = true;
          repairs.push(`Set default active status for user ${user.username || index}`);
        }
        if (user.emailVerified === undefined) {
          user.emailVerified = false;
          repairs.push(`Set default email verification for user ${user.username || index}`);
        }
        if (!user.role) {
          user.role = 'Crazy';
          repairs.push(`Set default role for user ${user.username || index}`);
        }
        if (!user.profile) {
          user.profile = {
            firstName: '',
            lastName: '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            bio: 'Welcome to the Crazy community! 🤪',
            location: '',
            website: '',
            github: ''
          };
          repairs.push(`Created missing profile for user ${user.username || index}`);
        }

        // Initialize user stats if missing
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
          repairs.push(`Initialized stats for user ${user.username || index}`);
        }
      });

      // Update metadata
      database.totalUsers = database.users.length;
      database.lastUpdated = new Date().toISOString();

      // Save repaired database
      localStorage.setItem('crazy-paste-user-database', JSON.stringify(database));
      
      // Sync with legacy storage
      localStorage.setItem('crazy-paste-users', JSON.stringify(database.users));
      
      return { 
        success: true, 
        message: `Database repaired successfully. ${repairs.length} issues fixed.`, 
        repairs 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Repair failed: ${error}`, 
        repairs 
      };
    }
  }
}

// Database query functions
export class UserQuery {
  
  // Search users by multiple criteria
  static searchUsers(criteria: {
    email?: string;
    username?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    createdAfter?: string;
    createdBefore?: string;
    hasProfile?: boolean;
  }): User[] {
    if (typeof window === 'undefined') return [];
    
    const database = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
    const users = database.users || [];

    return users.filter((user: User) => {
      if (criteria.email && !user.email.toLowerCase().includes(criteria.email.toLowerCase())) {
        return false;
      }
      if (criteria.username && !user.username.toLowerCase().includes(criteria.username.toLowerCase())) {
        return false;
      }
      if (criteria.isActive !== undefined && user.isActive !== criteria.isActive) {
        return false;
      }
      if (criteria.emailVerified !== undefined && user.emailVerified !== criteria.emailVerified) {
        return false;
      }
      if (criteria.createdAfter && new Date(user.createdAt) < new Date(criteria.createdAfter)) {
        return false;
      }
      if (criteria.createdBefore && new Date(user.createdAt) > new Date(criteria.createdBefore)) {
        return false;
      }
      if (criteria.hasProfile !== undefined) {
        const hasProfile = !!(user.profile && (user.profile.firstName || user.profile.lastName || user.profile.bio));
        if (hasProfile !== criteria.hasProfile) {
          return false;
        }
      }
      return true;
    });
  }

  // Get users with pagination
  static getUsersPaginated(page: number = 1, limit: number = 10, sortBy: string = 'createdAt'): {
    users: User[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
  } {
    if (typeof window === 'undefined') {
      return { users: [], totalUsers: 0, totalPages: 0, currentPage: 1 };
    }

    const database = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
    const allUsers = database.users || [];

    // Sort users
    const sortedUsers = [...allUsers].sort((a, b) => {
      switch (sortBy) {
        case 'email':
          return a.email.localeCompare(b.email);
        case 'username':
          return a.username.localeCompare(b.username);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'lastLogin':
          return (b.lastLogin || '').localeCompare(a.lastLogin || '');
        default:
          return 0;
      }
    });

    const totalUsers = sortedUsers.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const startIndex = (page - 1) * limit;
    const users = sortedUsers.slice(startIndex, startIndex + limit);

    return {
      users,
      totalUsers,
      totalPages,
      currentPage: page
    };
  }
}
