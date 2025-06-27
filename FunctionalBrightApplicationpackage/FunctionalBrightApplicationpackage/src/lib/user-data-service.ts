
export interface UserData {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  joinDate: string;
  role: string;
  isGuest?: boolean;
  isActive: boolean;
  stats: {
    pastes: number;
    views: number;
    followers: number;
    following: number;
    reputation: number;
  };
  languages: string[];
}

export class UserDataService {
  private static readonly USERS_KEY = 'crazy-paste-all-users';
  private static readonly BACKUP_KEY = 'crazy-paste-users-backup';

  // Save user data to localStorage with backup
  static saveUserData(users: UserData[]): boolean {
    try {
      if (typeof window === 'undefined') return false;

      // Create backup of current data
      const currentData = localStorage.getItem(this.USERS_KEY);
      if (currentData) {
        localStorage.setItem(this.BACKUP_KEY, currentData);
      }

      // Save new data with timestamp
      const dataToSave = {
        users: users,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      localStorage.setItem(this.USERS_KEY, JSON.stringify(dataToSave));
      
      // Also update legacy storage for compatibility
      localStorage.setItem('crazy-paste-users', JSON.stringify(users));

      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  // Load all user data from localStorage
  static loadUserData(): UserData[] {
    try {
      if (typeof window === 'undefined') return [];

      const data = localStorage.getItem(this.USERS_KEY);
      if (!data) {
        // Fallback to legacy storage
        const legacyData = localStorage.getItem('crazy-paste-users');
        return legacyData ? JSON.parse(legacyData) : [];
      }

      const parsedData = JSON.parse(data);
      return parsedData.users || [];
    } catch (error) {
      console.error('Failed to load user data:', error);
      return [];
    }
  }

  // Add or update a user
  static saveUser(user: UserData): boolean {
    const existingUsers = this.loadUserData();
    const userIndex = existingUsers.findIndex(u => u.id === user.id);

    if (userIndex >= 0) {
      existingUsers[userIndex] = user;
    } else {
      existingUsers.push(user);
    }

    return this.saveUserData(existingUsers);
  }

  // Get user by ID
  static getUserById(id: string): UserData | null {
    const users = this.loadUserData();
    return users.find(u => u.id === id) || null;
  }

  // Get user by username
  static getUserByUsername(username: string): UserData | null {
    const users = this.loadUserData();
    return users.find(u => u.username === username) || null;
  }

  // Search users
  static searchUsers(query: string): UserData[] {
    const users = this.loadUserData();
    const lowerQuery = query.toLowerCase();
    
    return users.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      user.displayName.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      (user.bio && user.bio.toLowerCase().includes(lowerQuery))
    );
  }

  // Get users with pagination
  static getUsersPaginated(page: number = 1, limit: number = 20): {
    users: UserData[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
  } {
    const allUsers = this.loadUserData();
    const totalUsers = allUsers.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const startIndex = (page - 1) * limit;
    const users = allUsers.slice(startIndex, startIndex + limit);

    return {
      users,
      totalUsers,
      totalPages,
      currentPage: page
    };
  }

  // Export user data as JSON
  static exportUserData(): string {
    const users = this.loadUserData();
    return JSON.stringify({
      users,
      exportDate: new Date().toISOString(),
      totalUsers: users.length
    }, null, 2);
  }

  // Import user data from JSON
  static importUserData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      if (!data.users || !Array.isArray(data.users)) {
        return { success: false, message: 'Invalid data format' };
      }

      const success = this.saveUserData(data.users);
      return success 
        ? { success: true, message: `Imported ${data.users.length} users successfully` }
        : { success: false, message: 'Failed to save imported data' };
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` };
    }
  }

  // Get statistics about users
  static getUserStats(): {
    totalUsers: number;
    registeredUsers: number;
    guestUsers: number;
    activeUsers: number;
    totalPastes: number;
    totalViews: number;
  } {
    const users = this.loadUserData();
    
    return {
      totalUsers: users.length,
      registeredUsers: users.filter(u => !u.isGuest).length,
      guestUsers: users.filter(u => u.isGuest).length,
      activeUsers: users.filter(u => u.isActive).length,
      totalPastes: users.reduce((sum, u) => sum + u.stats.pastes, 0),
      totalViews: users.reduce((sum, u) => sum + u.stats.views, 0)
    };
  }
}
