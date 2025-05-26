// Authentication types and utilities

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
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
export function registerUser(email: string, password: string): { success: boolean; message: string } {
  const users = getStoredUsers();

  // Check if user already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return { success: false, message: 'User with this email already exists' };
  }

  // Create new user
  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password, // In a real app, this should be hashed
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

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
