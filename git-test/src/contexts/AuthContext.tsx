"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUsers, registerUser as registerUserAuth, loginUser as loginUserAuth, getUserStats } from '@/lib/auth';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  website?: string;
  github?: string;
  joinDate: string;
  lastActive: string;
  stats: {
    totalPastes: number;
    publicPastes: number;
    privatePastes: number;
    totalViews: number;
    followers: number;
    following: number;
    reputation: number;
  };
  settings: {
    publicProfile: boolean;
    showEmail: boolean;
    allowFollows: boolean;
    darkMode: boolean;
    notifications: {
      email: boolean;
      browser: boolean;
      newFollower: boolean;
      pasteComment: boolean;
      weeklyDigest: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { username: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use auth utility to login
    const loginResult = loginUserAuth(email, password);
    
    if (!loginResult.success || !loginResult.user) {
      setLoading(false);
      return false;
    }

    // Get current user stats
    const userStats = getUserStats(loginResult.user.id);

    // Create user profile from registered user
    const loggedInUser: User = {
      id: loginResult.user.id,
      username: loginResult.user.username,
      email: loginResult.user.email,
      displayName: loginResult.user.username,
      bio: "Welcome to my profile! I'm a developer passionate about code sharing and collaboration.",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginResult.user.email}`,
      website: "",
      github: "",
      joinDate: loginResult.user.createdAt.split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      stats: userStats,
      settings: {
        publicProfile: true,
        showEmail: false,
        allowFollows: true,
        darkMode: true,
        notifications: {
          email: true,
          browser: true,
          newFollower: true,
          pasteComment: false,
          weeklyDigest: true
        }
      }
    };

    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    setLoading(false);
    return true;
  };

  const register = async (userData: { username: string; email: string; password: string }): Promise<boolean> => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use auth utility to register with username
    const registerResult = registerUserAuth(userData.email, userData.password, userData.username);
    
    if (!registerResult.success) {
      setLoading(false);
      return false;
    }

    // Get the newly registered user
    const registeredUsers = getStoredUsers();
    const newRegisteredUser = registeredUsers.find(user => user.email === userData.email);
    
    if (!newRegisteredUser) {
      setLoading(false);
      return false;
    }

    // Get initial stats (will be 0 for new user)
    const userStats = getUserStats(newRegisteredUser.id);

    // Create user profile
    const newUser: User = {
      id: newRegisteredUser.id,
      username: userData.username,
      email: userData.email,
      displayName: userData.username,
      bio: "New user exploring the platform!",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      website: "",
      github: "",
      joinDate: newRegisteredUser.createdAt.split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      stats: userStats,
      settings: {
        publicProfile: true,
        showEmail: false,
        allowFollows: true,
        darkMode: true,
        notifications: {
          email: true,
          browser: true,
          newFollower: true,
          pasteComment: false,
          weeklyDigest: true
        }
      }
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
