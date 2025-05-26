"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

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

    // Mock successful login with default user data
    const mockUser: User = {
      id: "user_123",
      username: "user123",
      email: email,
      displayName: "John Doe",
      bio: "Welcome to my profile! I'm a developer passionate about code sharing and collaboration.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      website: "",
      github: "",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      stats: {
        totalPastes: 0,
        publicPastes: 0,
        privatePastes: 0,
        totalViews: 0,
        followers: 0,
        following: 0,
        reputation: 0
      },
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

    setUser(mockUser);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    setLoading(false);
    return true;
  };

  const register = async (userData: { username: string; email: string; password: string }): Promise<boolean> => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful registration
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: userData.username,
      email: userData.email,
      displayName: userData.username,
      bio: "New user exploring the platform!",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      website: "",
      github: "",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      stats: {
        totalPastes: 0,
        publicPastes: 0,
        privatePastes: 0,
        totalViews: 0,
        followers: 0,
        following: 0,
        reputation: 0
      },
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
