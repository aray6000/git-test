// Authentication types and utilities

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  username: string;
  role?: string; // User role
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  lastContactSave?: string; // When contact info was last saved
  totalPastesCreated?: number; // Total pastes created for contact tracking
  isActive: boolean;
  emailVerified: boolean;
  isGuest?: boolean; // Flag to identify guest users
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
  };
}

export interface UserDatabase {
  users: User[];
  totalUsers: number;
  lastUpdated: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Storage keys
const USERS_KEY = 'crazy-paste-users';
const CURRENT_USER_KEY = 'crazy-paste-current-user';
const USER_DB_KEY = 'crazy-paste-user-database';

// Initialize user database
export function initializeUserDatabase(): UserDatabase {
  if (typeof window === 'undefined') return { users: [], totalUsers: 0, lastUpdated: new Date().toISOString() };

  const stored = localStorage.getItem(USER_DB_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure all users have required fields
      if (parsed.users && Array.isArray(parsed.users)) {
        parsed.users.forEach((user: User) => {
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
          }
        });
      }
      return parsed;
    } catch (error) {
      console.error('Error parsing user database:', error);
    }
  }

  // Create initial database structure
  const initialDb: UserDatabase = {
    users: [],
    totalUsers: 0,
    lastUpdated: new Date().toISOString()
  };

  localStorage.setItem(USER_DB_KEY, JSON.stringify(initialDb));
  return initialDb;
}

// Get user database
export function getUserDatabase(): UserDatabase {
  if (typeof window === 'undefined') return { users: [], totalUsers: 0, lastUpdated: new Date().toISOString() };

  const stored = localStorage.getItem(USER_DB_KEY);
  return stored ? JSON.parse(stored) : initializeUserDatabase();
}

// Save user database
export function saveUserDatabase(database: UserDatabase): void {
  if (typeof window === 'undefined') return;

  database.lastUpdated = new Date().toISOString();
  database.totalUsers = database.users.length;

  localStorage.setItem(USER_DB_KEY, JSON.stringify(database));

  // Also maintain backward compatibility with old storage
  localStorage.setItem(USERS_KEY, JSON.stringify(database.users));
}

// Get all registered users (backward compatibility)
export function getStoredUsers(): User[] {
  const database = getUserDatabase();
  return database.users;
}

// Save users to localStorage (backward compatibility)
export function saveUsers(users: User[]): void {
  const database = getUserDatabase();
  database.users = users;
  saveUserDatabase(database);
}

// Add user to database
export function addUserToDatabase(user: User): boolean {
  try {
    const database = getUserDatabase();

    // Check if user already exists
    const existingUser = database.users.find(u => u.email === user.email || u.id === user.id);
    if (existingUser) {
      return false;
    }

    database.users.push(user);
    saveUserDatabase(database);
    return true;
  } catch (error) {
    console.error('Error adding user to database:', error);
    return false;
  }
}

// Update user in database
export function updateUserInDatabase(userId: string, updates: Partial<User>): boolean {
  try {
    const database = getUserDatabase();
    const userIndex = database.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    database.users[userIndex] = {
      ...database.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveUserDatabase(database);
    return true;
  } catch (error) {
    console.error('Error updating user in database:', error);
    return false;
  }
}

// Delete user from database
export function deleteUserFromDatabase(userId: string): boolean {
  try {
    const database = getUserDatabase();
    const userIndex = database.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    // Mark user as inactive instead of removing completely (for data integrity)
    database.users[userIndex].isActive = false;
    database.users[userIndex].updatedAt = new Date().toISOString();

    // Then remove from database for complete deletion
    database.users.splice(userIndex, 1);
    saveUserDatabase(database);

    // Also remove user stats
    localStorage.removeItem(`user-stats-${userId}`);

    // Remove from current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      saveCurrentUser(null);
    }

    // Clean up all references to this user
    cleanupDeletedUserReferences(userId);

    return true;
  } catch (error) {
    console.error('Error deleting user from database:', error);
    return false;
  }
}

// Clean up all references to a deleted user
export function cleanupDeletedUserReferences(userId: string): void {
  try {
    // Clean up legacy users list
    const legacyUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const cleanedLegacyUsers = legacyUsers.filter((user: User) => user.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(cleanedLegacyUsers));

    // Clean up any cached user data
    localStorage.removeItem(`user-cache-${userId}`);
    localStorage.removeItem(`user-profile-${userId}`);

    // Remove user from any cached followers/following lists
    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    allUsers.forEach((user: User) => {
      const userStatsKey = `user-stats-${user.id}`;
      const userStats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');

      // Clean up any follower/following relationships (if implemented)
      if (userStats.followingList) {
        userStats.followingList = userStats.followingList.filter((id: string) => id !== userId);
      }
      if (userStats.followersList) {
        userStats.followersList = userStats.followersList.filter((id: string) => id !== userId);
      }

      localStorage.setItem(userStatsKey, JSON.stringify(userStats));
    });
  } catch (error) {
    console.error('Error cleaning up deleted user references:', error);
  }
}

// Cleanup function to sync legacy users list with main database
export function cleanupDeletedUsers(): void {
  try {
    const database = getUserDatabase();
    const legacyUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // Filter legacy users to only include those that still exist in main database
    const cleanedUsers = legacyUsers.filter((legacyUser: User) => 
      database.users.some(dbUser => dbUser.id === legacyUser.id)
    );

    // Update the legacy users list
    localStorage.setItem(USERS_KEY, JSON.stringify(cleanedUsers));
  } catch (error) {
    console.error('Error cleaning up deleted users:', error);
  }
}

// Find user by email
export function findUserByEmail(email: string): User | null {
  const database = getUserDatabase();
  return database.users.find(u => u.email === email) || null;
}

// Find user by username
export function findUserByUsername(username: string): User | null {
  const database = getUserDatabase();
  return database.users.find(u => u.username === username) || null;
}

// Find user by ID
export function findUserById(id: string): User | null {
  const database = getUserDatabase();
  return database.users.find(u => u.id === id) || null;
}

// Get database statistics
export function getDatabaseStats(): {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  recentUsers: number;
  lastUpdated: string;
} {
  const database = getUserDatabase();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    totalUsers: database.totalUsers,
    activeUsers: database.users.filter(u => u.isActive).length,
    verifiedUsers: database.users.filter(u => u.emailVerified).length,
    recentUsers: database.users.filter(u => new Date(u.createdAt) > sevenDaysAgo).length,
    lastUpdated: database.lastUpdated
  };
}

// Debug function to list all users
export function debugListUsers(): void {
  const database = getUserDatabase();
  console.log('=== USER DATABASE DEBUG ===');
  console.log('Total users:', database.totalUsers);
  console.log('Users in database:', database.users.length);
  
  database.users.forEach((user, index) => {
    console.log(`User ${index + 1}:`, {
      id: user.id,
      email: user.email,
      username: user.username,
      password: user.password,
      isActive: user.isActive,
      isGuest: user.isGuest
    });
  });
  console.log('=== END DEBUG ===');
}

// Generate guest user
export function generateGuestUser(): User {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const guestId = `guest_${timestamp}_${randomId}`;
  const randomNumber = Math.floor(Math.random() * 9999) + 1;
  
  return {
    id: guestId,
    email: `guest${timestamp}@temp.local`,
    password: '', // No password for guests
    username: `Guest${randomNumber}`,
    role: 'Guest', // Guests have Guest role, not User
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    emailVerified: false,
    isGuest: true, // Flag to identify guest users
    profile: {
      firstName: '',
      lastName: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest${timestamp}`,
      bio: 'Guest user exploring CrazyPaste',
      location: '',
      website: '',
      github: ''
    }
  };
}

// Get current authenticated user or create guest
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    try {
      const user = JSON.parse(stored);
      
      // Load from contact storage system for all users
      const contactStorageKey = `profile-storage-${user.id}`;
      const contactStorage = localStorage.getItem(contactStorageKey);
      let profileData = {};
      
      if (contactStorage) {
        try {
          const parsed = JSON.parse(contactStorage);
          profileData = parsed.profileData || {};
        } catch (error) {
          console.error('Error parsing contact storage:', error);
        }
      }

      // Also check legacy contact key for backward compatibility
      const contactKey = `user-contact-${user.id}`;
      const savedContact = localStorage.getItem(contactKey);
      let contactData = {};
      if (savedContact) {
        try {
          contactData = JSON.parse(savedContact);
        } catch (error) {
          console.error('Error parsing contact data:', error);
        }
      }

      // Merge all data sources
      const mergedUser = {
        ...user,
        bio: profileData.bio || user.bio || user.profile?.bio || '',
        location: profileData.location || user.location || user.profile?.location || '',
        website: profileData.website || contactData.website || user.website || user.profile?.website || '',
        github: profileData.github || contactData.github || user.github || user.profile?.github || '',
        discord: profileData.discord || contactData.discord || user.discord || '',
        telegram: profileData.telegram || contactData.telegram || user.telegram || '',
        twitter: profileData.twitter || contactData.twitter || user.twitter || '',
        profile: {
          ...user.profile,
          firstName: profileData.firstName || user.profile?.firstName || '',
          lastName: profileData.lastName || user.profile?.lastName || '',
          bio: profileData.bio || user.bio || user.profile?.bio || '',
          location: profileData.location || user.location || user.profile?.location || '',
          website: profileData.website || contactData.website || user.website || user.profile?.website || '',
          github: profileData.github || contactData.github || user.github || user.profile?.github || ''
        }
      };
      
      return mergedUser;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
  
  // Create and store guest user for non-authenticated sessions
  const guestUser = generateGuestUser();
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
  return guestUser;
}

// Get only registered (non-guest) users
export function getRegisteredUsers(): User[] {
  const database = getUserDatabase();
  return database.users.filter(u => !u.isGuest && u.isActive);
}

// Save current user to localStorage
export function saveCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Register a new user using the new registration data structure
export function registerUser(email: string, password: string, username?: string): { success: boolean; message: string; user?: User } {
  console.log('=== REGISTRATION ATTEMPT START ===');
  console.log('Registration attempt for email:', email);
  console.log('Username provided:', username);
  console.log('Password provided:', password ? 'Yes (length: ' + password.length + ')' : 'No');
  
  // Import registration functions
  const { 
    addRegistrationToDatabase, 
    findRegistrationByEmail, 
    findRegistrationByUsername,
    migrateRegistrationToUserDatabase 
  } = require('./registration-data');

  // Initialize database if needed
  initializeUserDatabase();

  // Trim and validate inputs
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();
  
  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, message: 'Email and password are required' };
  }

  // Check if user already exists in main database (case insensitive)
  const database = getUserDatabase();
  const existingUser = database.users.find(u => u.email.toLowerCase() === trimmedEmail);
  if (existingUser) {
    console.log('User already exists with email:', trimmedEmail);
    return { success: false, message: 'User with this email already exists' };
  }

  // Check if registration already exists
  const existingRegistration = findRegistrationByEmail(trimmedEmail);
  if (existingRegistration) {
    console.log('Registration already exists with email:', trimmedEmail);
    return { success: false, message: 'Registration already exists for this email' };
  }

  // Check if username already exists
  const finalUsername = username?.trim() || trimmedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
  const existingUsername = database.users.find(u => u.username.toLowerCase() === finalUsername.toLowerCase());
  const existingRegUsername = findRegistrationByUsername(finalUsername);
  
  if (existingUsername || existingRegUsername) {
    console.log('Username already taken:', finalUsername);
    return { success: false, message: 'Username already taken' };
  }

  // Create registration data
  const registrationId = crypto.randomUUID();
  const registrationData = {
    id: registrationId,
    email: trimmedEmail,
    username: finalUsername,
    password: trimmedPassword,
    registeredAt: new Date().toISOString(),
    verificationStatus: 'verified' as const, // Auto-verify for now
    profile: {
      firstName: '',
      lastName: '',
      bio: 'Welcome to the Crazy community! 🤪',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedEmail}`
    }
  };

  console.log('Creating registration:');
  console.log('  - Email:', registrationData.email);
  console.log('  - Username:', registrationData.username);
  console.log('  - ID:', registrationData.id);

  // Add to registration database
  const regAdded = addRegistrationToDatabase(registrationData);
  if (!regAdded) {
    console.log('Failed to add registration to database');
    return { success: false, message: 'Failed to create registration' };
  }

  // Immediately migrate to main user database since we auto-verify
  const migrated = migrateRegistrationToUserDatabase(registrationId);
  if (!migrated) {
    console.log('Failed to migrate registration to user database');
    return { success: false, message: 'Failed to create user account' };
  }

  // Get the newly created user
  const newUser = findUserById(registrationId);
  if (!newUser) {
    console.log('Failed to retrieve newly created user');
    return { success: false, message: 'Failed to create user account' };
  }

  // Initialize user stats with zeros
  const userStatsKey = `user-stats-${newUser.id}`;
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

  console.log('User registered successfully:', newUser.username);
  console.log('=== REGISTRATION ATTEMPT END ===');

  return { success: true, message: 'User registered successfully', user: newUser };
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; message: string; user?: User } {
  console.log('=== LOGIN ATTEMPT START ===');
  console.log('Login attempt for email:', email);
  console.log('Password provided:', password ? 'Yes (length: ' + password.length + ')' : 'No');
  
  // Trim inputs first
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();
  
  // Initialize database to ensure it exists
  const database = getUserDatabase();
  console.log('Database loaded, total users:', database.users.length);
  
  // List all users for debugging
  console.log('All users in database:');
  database.users.forEach((u, index) => {
    console.log(`  ${index + 1}. Email: ${u.email}, Username: ${u.username}, Active: ${u.isActive}, Guest: ${u.isGuest}`);
  });
  
  // Find user with matching email (case insensitive) - exclude guests
  const user = database.users.find(u => 
    u.email.toLowerCase() === trimmedEmail && 
    u.isActive && 
    !u.isGuest
  );
  console.log('Found user:', user ? 'Yes' : 'No');
  
  if (!user) {
    console.log('User not found with email:', trimmedEmail);
    console.log('Available non-guest emails:', database.users.filter(u => !u.isGuest).map(u => u.email));
    return { success: false, message: 'Invalid email or password' };
  }

  console.log('User details:');
  console.log('  - ID:', user.id);
  console.log('  - Email:', user.email);
  console.log('  - Username:', user.username);
  console.log('  - Stored password:', user.password);
  console.log('  - Active:', user.isActive);
  console.log('  - Guest:', user.isGuest);
  
  // Direct password comparison - both already trimmed
  console.log('Password comparison:');
  console.log('  - Stored:', user.password);
  console.log('  - Provided:', trimmedPassword);
  console.log('  - Match:', user.password === trimmedPassword);
  
  // Check password match
  if (user.password !== trimmedPassword) {
    console.log('Password mismatch - login failed');
    return { success: false, message: 'Invalid email or password' };
  }

  if (!user.isActive) {
    console.log('User account is inactive');
    return { success: false, message: 'Account has been deactivated' };
  }

  console.log('Login successful for user:', user.username);
  console.log('=== LOGIN ATTEMPT END ===');

  // Update last login time
  updateUserInDatabase(user.id, {
    lastLogin: new Date().toISOString()
  });

  // Get updated user data and save as current user
  const updatedUser = findUserById(user.id);
  if (updatedUser) {
    saveCurrentUser(updatedUser);
    return { success: true, message: 'Login successful', user: updatedUser };
  }

  return { success: false, message: 'Login failed' };
}

// Logout user
export function logoutUser(): void {
  saveCurrentUser(null);
}

// Check if user is authenticated (not guest)
export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  return user !== null && !user.isGuest;
}

// Check if current user is guest
export function isGuestUser(): boolean {
  const user = getCurrentUser();
  return user !== null && user.isGuest === true;
}

// Update user stats
export function updateUserStats(userId: string, statUpdates: {
  totalPastes?: number;
  publicPastes?: number;
  privatePastes?: number;
  totalViews?: number;
  followers?: number;
  following?: number;
  reputation?: number;
}): void {
  const users = getStoredUsers();
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) return;

  // Store current stats in localStorage for the user profile system
  const userStatsKey = `user-stats-${userId}`;
  const currentStats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');

  const updatedStats = {
    totalPastes: currentStats.totalPastes || 0,
    publicPastes: currentStats.publicPastes || 0,
    privatePastes: currentStats.privatePastes || 0,
    totalViews: currentStats.totalViews || 0,
    followers: currentStats.followers || 0,
    following: currentStats.following || 0,
    reputation: currentStats.reputation || 0,
    ...statUpdates
  };

  localStorage.setItem(userStatsKey, JSON.stringify(updatedStats));
}

// Get user stats
export function getUserStats(userId: string): {
  totalPastes: number;
  publicPastes: number;
  privatePastes: number;
  totalViews: number;
  followers: number;
  following: number;
} {
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

  const userStatsKey = `user-stats-${userId}`;
  const stats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');

  return {
    totalPastes: stats.totalPastes || 0,
    publicPastes: stats.publicPastes || 0,
    privatePastes: stats.privatePastes || 0,
    totalViews: stats.totalViews || 0,
    followers: stats.followers || 0,
    following: stats.following || 0
  };
}

// Increment paste count when user creates a paste
export function incrementPasteCount(userId: string, isPublic: boolean = true): void {
  const currentStats = getUserStats(userId);
  updateUserStats(userId, {
    totalPastes: currentStats.totalPastes + 1,
    publicPastes: isPublic ? currentStats.publicPastes + 1 : currentStats.publicPastes,
    privatePastes: !isPublic ? currentStats.privatePastes + 1 : currentStats.privatePastes
  });
}

// Increment view count
export function incrementViewCount(userId: string): void {
  const currentStats = getUserStats(userId);
  updateUserStats(userId, {
    totalViews: currentStats.totalViews + 1,
    reputation: currentStats.reputation + 1 // 1 reputation per view
  });
}

// Increment follower count
export function incrementFollowerCount(userId: string): void {
  const currentStats = getUserStats(userId);
  updateUserStats(userId, {
    followers: currentStats.followers + 1,
    reputation: currentStats.reputation + 5 // 5 reputation per follower
  });
}

// Decrement follower count
export function decrementFollowerCount(userId: string): void {
  const currentStats = getUserStats(userId);
  updateUserStats(userId, {
    followers: Math.max(0, currentStats.followers - 1),
    reputation: Math.max(0, currentStats.reputation - 5)
  });
}

// Update user role
export function updateUserRole(userId: string, newRole: string): boolean {
  try {
    const database = getUserDatabase();
    const userIndex = database.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return false;
    }

    database.users[userIndex].role = newRole as any;
    database.users[userIndex].updatedAt = new Date().toISOString();

    saveUserDatabase(database);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

// Set user role by username
export function setUserRoleByUsername(username: string, newRole: string): boolean {
  try {
    const user = findUserByUsername(username);
    if (!user) {
      console.error(`User with username "${username}" not found`);
      return false;
    }

    return updateUserRole(user.id, newRole);
  } catch (error) {
    console.error('Error setting user role by username:', error);
    return false;
  }
}

// Upgrade all existing users without roles to Crazy role
export function upgradeUsersToFunRole(): { upgraded: number; message: string } {
  try {
    const database = getUserDatabase();
    let upgradedCount = 0;

    database.users = database.users.map(user => {
      // If user doesn't have a role or has 'User' role, upgrade to 'Crazy'
      if (!user.role || user.role === 'User') {
        upgradedCount++;
        return {
          ...user,
          role: 'Crazy',
          updatedAt: new Date().toISOString()
        };
      }
      return user;
    });

    saveUserDatabase(database);

    return {
      upgraded: upgradedCount,
      message: `Successfully upgraded ${upgradedCount} users to Crazy role!`
    };
  } catch (error) {
    console.error('Error upgrading users to Crazy role:', error);
    return {
      upgraded: 0,
      message: `Failed to upgrade users: ${error}`
    };
  }
}