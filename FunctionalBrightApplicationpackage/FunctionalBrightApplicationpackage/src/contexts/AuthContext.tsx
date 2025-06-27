"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUsers, registerUser as registerUserAuth, loginUser as loginUserAuth, getUserStats, generateGuestUser } from '@/lib/auth';
import { UserRole, ROLE_FEATURES } from '@/lib/types';

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
  role: UserRole;
  isGuest?: boolean;
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
  hasPermission: (permission: keyof typeof ROLE_FEATURES.Owner.features) => boolean;
  getUserRole: () => UserRole;
  getRoleFeatures: () => typeof ROLE_FEATURES.Owner.features;
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
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // If it's a guest user, ensure it has proper structure
        if (parsedUser.isGuest) {
          const guestUser = createGuestUserProfile(parsedUser);
          setUser(guestUser);
          localStorage.setItem('currentUser', JSON.stringify(guestUser));
          setLoading(false);
          return;
        }
        
        // Load from contact storage system for registered users
        const contactStorageKey = `profile-storage-${parsedUser.id}`;
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
        const contactKey = `user-contact-${parsedUser.id}`;
        const savedContact = localStorage.getItem(contactKey);
        let contactData = {};
        if (savedContact) {
          try {
            contactData = JSON.parse(savedContact);
          } catch (error) {
            console.error('Error parsing contact data:', error);
          }
        }

        // Merge all data sources for registered users
        const mergedUser = {
          ...parsedUser,
          displayName: profileData.displayName || parsedUser.displayName || parsedUser.username,
          bio: profileData.bio || parsedUser.bio || parsedUser.profile?.bio || "Welcome to Crazy Paste!",
          location: profileData.location || parsedUser.location || parsedUser.profile?.location || '',
          website: profileData.website || contactData.website || parsedUser.website || parsedUser.profile?.website || '',
          github: profileData.github || contactData.github || parsedUser.github || parsedUser.profile?.github || '',
          discord: profileData.discord || contactData.discord || parsedUser.discord || '',
          telegram: profileData.telegram || contactData.telegram || parsedUser.telegram || '',
          twitter: profileData.twitter || contactData.twitter || parsedUser.twitter || '',
          role: parsedUser.role || 'Crazy', // Ensure registered users have a role
          profile: {
            ...parsedUser.profile,
            firstName: profileData.firstName || parsedUser.profile?.firstName || '',
            lastName: profileData.lastName || parsedUser.profile?.lastName || '',
            bio: profileData.bio || parsedUser.bio || parsedUser.profile?.bio || "Welcome to Crazy Paste!",
            location: profileData.location || parsedUser.location || parsedUser.profile?.location || '',
            website: profileData.website || contactData.website || parsedUser.website || parsedUser.profile?.website || '',
            github: profileData.github || contactData.github || parsedUser.github || parsedUser.profile?.github || ''
          }
        };
        
        setUser(mergedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
        // Create guest user if no valid session
        const guestUser = createNewGuestUser();
        localStorage.setItem('currentUser', JSON.stringify(guestUser));
        setUser(guestUser);
      }
    } else {
      // Create guest user for new sessions
      const guestUser = createNewGuestUser();
      localStorage.setItem('currentUser', JSON.stringify(guestUser));
      setUser(guestUser);
    }
    setLoading(false);
  }, []);

  // Helper function to create a new guest user
  const createNewGuestUser = (): User => {
    const authGuestUser = generateGuestUser();
    return createGuestUserProfile(authGuestUser);
  };

  // Helper function to create guest user profile
  const createGuestUserProfile = (authUser: any): User => {
    return {
      id: authUser.id,
      username: authUser.username,
      email: authUser.email,
      displayName: authUser.username,
      bio: "Guest user exploring CrazyPaste",
      avatar: authUser.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      website: "",
      github: "",
      discord: "",
      telegram: "",
      twitter: "",
      location: "",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      role: 'Guest' as UserRole, // Guest users have Guest role
      isGuest: true,
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
        publicProfile: false, // Guests have private profiles by default
        showEmail: false,
        allowFollows: false,
        darkMode: true,
        notifications: {
          email: false,
          browser: false,
          newFollower: false,
          pasteComment: false,
          weeklyDigest: false
        }
      }
    };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      console.log('AuthContext: Attempting login for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use auth utility to login
      const loginResult = loginUserAuth(email, password);
      console.log('AuthContext: Login result:', loginResult);

      if (!loginResult.success || !loginResult.user) {
        console.error('Login failed:', loginResult.message);
        setLoading(false);
        return false;
      }

      // Get current user stats
      const userStats = getUserStats(loginResult.user.id);

      // Load additional profile data from contact storage
      const contactStorageKey = `profile-storage-${loginResult.user.id}`;
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

      // Create complete user profile from stored user data
      const completeUser: User = {
        id: loginResult.user.id,
        username: loginResult.user.username,
        email: loginResult.user.email,
        displayName: profileData.displayName || loginResult.user.username,
        bio: profileData.bio || loginResult.user.profile?.bio || "Welcome to Crazy Paste!",
        avatar: loginResult.user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginResult.user.email}`,
        website: profileData.website || loginResult.user.profile?.website || "",
        github: profileData.github || loginResult.user.profile?.github || "",
        discord: profileData.discord || loginResult.user.discord || "",
        telegram: profileData.telegram || loginResult.user.telegram || "",
        twitter: profileData.twitter || loginResult.user.twitter || "",
        location: profileData.location || loginResult.user.location || "",
        joinDate: loginResult.user.createdAt.split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        role: (loginResult.user.role || 'Crazy') as UserRole,
        isGuest: false,
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

      setUser(completeUser);
      localStorage.setItem('currentUser', JSON.stringify(completeUser));
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
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

    // Create user profile with stats
    const userProfile: User = {
      id: newRegisteredUser.id,
      username: userData.username,
      email: userData.email,
      displayName: userData.username,
      bio: newRegisteredUser.profile?.bio || newRegisteredUser.bio || "Welcome to Crazy Paste!",
      avatar: newRegisteredUser.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newRegisteredUser.email}`,
      website: newRegisteredUser.profile?.website || newRegisteredUser.website || "",
      github: newRegisteredUser.profile?.github || newRegisteredUser.github || "",
      discord: newRegisteredUser.discord || "",
      telegram: newRegisteredUser.telegram || "",
      twitter: newRegisteredUser.twitter || "",
      location: newRegisteredUser.location || "",
      joinDate: newRegisteredUser.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      role: (newRegisteredUser.role || 'Crazy') as UserRole,
      stats: userStats,
      profile: newRegisteredUser.profile || {
        firstName: '',
        lastName: '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newRegisteredUser.email}`,
        bio: newRegisteredUser.bio || "Welcome to Crazy Paste!",
        location: newRegisteredUser.location || '',
        website: newRegisteredUser.website || '',
        github: newRegisteredUser.github || ''
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

    setUser(userProfile);
    localStorage.setItem('currentUser', JSON.stringify(userProfile));
    setLoading(false);
    return true;
  };

  const logout = () => {
    // Create new guest user after logout
    const guestUser = generateGuestUser();
    setUser(guestUser);
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
  };

  const hasPermission = (permission: keyof typeof ROLE_FEATURES.Owner.features): boolean => {
    if (!user || !user.role) return false;
    const roleFeatures = ROLE_FEATURES[user.role];
    if (!roleFeatures || !roleFeatures.features) return false;
    return roleFeatures.features[permission];
  };

  const getUserRole = (): UserRole => {
    return user?.role || 'User';
  };

  const getRoleFeatures = () => {
    if (!user || !user.role) return ROLE_FEATURES.User.features;
    const roleFeatures = ROLE_FEATURES[user.role];
    if (!roleFeatures || !roleFeatures.features) return ROLE_FEATURES.User.features;
    return roleFeatures.features;
  };

  const value = {
    user,
    isAuthenticated: !!user && !user.isGuest,
    login,
    register,
    logout,
    loading,
    hasPermission,
    getUserRole,
    getRoleFeatures
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};