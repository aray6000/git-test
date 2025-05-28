// Authentication types and utilities

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  username: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Storage keys
const USERS_KEY = 'crazy-paste-users';
const CURRENT_USER_KEY = 'crazy-paste-current-user';

// Get all registered users
export function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save users to localStorage
export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get current authenticated user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
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

// Register a new user
export function registerUser(email: string, password: string, username?: string): { success: boolean; message: string } {
  const users = getStoredUsers();

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return { success: false, message: 'User with this email already exists' };
  }

  // Check if username already exists
  if (username) {
    const existingUsername = users.find(user => user.username === username);
    if (existingUsername) {
      return { success: false, message: 'Username already taken' };
    }
  }

  // Create new user
  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password, // In a real app, this should be hashed
    username: username || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_'),
    createdAt: new Date().toISOString(),
  };

  // Store users
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

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

  return { success: true, message: 'User registered successfully' };
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getStoredUsers();

  // Find user with matching email and password
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  saveCurrentUser(user);
  return { success: true, message: 'Login successful', user };
}

// Logout user
export function logoutUser(): void {
  saveCurrentUser(null);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
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
  reputation: number;
} {
  if (typeof window === 'undefined') {
    return {
      totalPastes: 0,
      publicPastes: 0,
      privatePastes: 0,
      totalViews: 0,
      followers: 0,
      following: 0,
      reputation: 0
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
    following: stats.following || 0,
    reputation: stats.reputation || 0
  };
}

// Increment paste count when user creates a paste
export function incrementPasteCount(userId: string, isPublic: boolean = true): void {
  const currentStats = getUserStats(userId);
  updateUserStats(userId, {
    totalPastes: currentStats.totalPastes + 1,
    publicPastes: isPublic ? currentStats.publicPastes + 1 : currentStats.publicPastes,
    privatePastes: !isPublic ? currentStats.privatePastes + 1 : currentStats.privatePastes,
    reputation: currentStats.reputation + (isPublic ? 2 : 1) // More reputation for public pastes
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