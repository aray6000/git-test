"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiCode,
  FiEye,
  FiClock,
  FiLock,
  FiCalendar,
  FiActivity,
  FiStar,
  FiGithub,
  FiGlobe,
  FiUserPlus,
  FiUserMinus,
  FiMapPin
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Get real users from localStorage
const getRealUsers = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
};

// Get user pastes from localStorage
const getUserPastes = (userId: string) => {
  if (typeof window === 'undefined') return [];
  const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
  return allPastes.filter((paste: any) => paste.userId === userId && !paste.password);
};

// Get user stats from localStorage
const getUserStats = (userId: string) => {
  if (typeof window === 'undefined') return { pastes: 0, views: 0, followers: 0, reputation: 0 };
  const userStatsKey = `user-stats-${userId}`;
  const stats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');
  return {
    pastes: stats.totalPastes || 0,
    views: stats.totalViews || 0,
    followers: stats.followers || 0
  };
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [user, setUser] = useState<any | null>(null);
  const [userPastes, setUserPastes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Get current user - allow viewing without authentication
    const currentUserData = JSON.parse(localStorage.getItem('crazy-paste-current-user') || 'null');
    setCurrentUser(currentUserData);

    // Load users directly from the main database to ensure accuracy
    const userDatabase = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
    const databaseUsers = userDatabase.users || [];

    // Find user by username from database users
    const foundUser = databaseUsers.find((u: any) => {
      const emailUsername = u.email.split('@')[0];
      const storedUsername = u.username;
      const displayName = u.displayName || emailUsername;

      return emailUsername === username || 
             storedUsername === username || 
             displayName === username ||
             u.id === username;
    });

    // If user not found in database, they were deleted or never existed
    if (!foundUser) {
      // Clean up any stale cache entries
      const realUsers = getRealUsers();
      const staleUser = realUsers.find((u: any) => {
        const emailUsername = u.email.split('@')[0];
        const storedUsername = u.username;
        const displayName = u.displayName || emailUsername;

        return emailUsername === username || 
               storedUsername === username || 
               displayName === username ||
               u.id === username;
      });

      if (staleUser) {
        // Remove stale user from cache
        const updatedUsers = realUsers.filter((u: any) => u.id !== staleUser.id);
        localStorage.setItem('crazy-paste-users', JSON.stringify(updatedUsers));
      }

      setUser(null);
      setLoading(false);
      return;
    }

    if (foundUser) {
      const userStats = getUserStats(foundUser.id);
      const userPastes = getUserPastes(foundUser.id);

      // Set a static online status to prevent hydration mismatches
      const isOnline = false;

      const formattedUser = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username || foundUser.email.split('@')[0],
        displayName: foundUser.displayName || foundUser.username || foundUser.email.split('@')[0],
        avatar: foundUser.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.email}`,
        bio: foundUser.bio || foundUser.profile?.bio || "No bio available",
        location: foundUser.profile?.location || "",
        website: foundUser.profile?.website || "",
        github: foundUser.profile?.github || "",
        joinDate: foundUser.createdAt,
        stats: userStats,
        languages: foundUser.languages || [],
        isFollowing: false,
        isOnline: isOnline, // Consistent deterministic online status
        publicProfile: true
        // Note: password is intentionally excluded for security
      };

      setUser(formattedUser);
      setUserPastes(userPastes);
    }
    setLoading(false);
  }, [username, mounted]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleFollow = React.useCallback(() => {
    if (!user) return;

    const isCurrentlyFollowing = user.isFollowing;

    setUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isFollowing: !prev.isFollowing,
        stats: {
          ...prev.stats,
          followers: prev.isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
        }
      };
    });

    toast.success(
      isCurrentlyFollowing
        ? `Unfollowed ${user.displayName}`
        : `Now following ${user.displayName}`
    );
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <FiUser className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4">
          The user @{username} does not exist or their profile is private.
        </p>
        <Button asChild>
          <Link href="/users">Browse Users</Link>
        </Button>
      </div>
    );
  }

  if (!user.publicProfile) {
    return (
      <div className="text-center py-12">
        <FiLock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Private Profile</h3>
        <p className="text-muted-foreground mb-4">
          This user's profile is private.
        </p>
        <Button asChild>
          <Link href="/users">Browse Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto" suppressHydrationWarning>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-8 backdrop-blur-sm border border-border/30">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-primary/50">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {user.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-primary">
                  {user.displayName}
                </h1>
                <Badge variant="secondary" className="bg-primary/20">
                  @{user.username}
                </Badge>
                {user.isOnline && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Online
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground mb-4 max-w-2xl">{user.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </div>
                {user.location && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1 hover:text-primary transition-colors">
                    <FiGlobe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {user.github && (
                  <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1 hover:text-primary transition-colors">
                    <FiGithub className="w-4 h-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {currentUser && currentUser.id !== user.id && (
                <CyberpunkButton
                  variant={user.isFollowing ? "outline" : "default"}
                  onClick={handleFollow}
                  className="flex items-center gap-2"
                >
                  {user.isFollowing ? (
                    <>
                      <FiUserMinus className="w-4 h-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </CyberpunkButton>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{user.stats.pastes}</div>
            <div className="text-sm text-muted-foreground">Pastes</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1">{user.stats.views.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Views</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">{user.stats.followers}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
      </motion.div>


      {/* Languages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCode className="w-5 h-5" />
              Languages & Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.languages.map(lang => (
                <Badge key={lang} variant="secondary" className="bg-primary/20">
                  {lang}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Public Pastes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiEye className="w-5 h-5" />
              Public Pastes
            </CardTitle>
            <CardDescription>
              Recent public code snippets and pastes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userPastes.map((paste, index) => (
              <motion.div
                key={paste.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-background/30 border-border/30 hover:bg-background/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg">{paste.title}</h4>
                          <Badge variant="outline">{paste.language}</Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <FiEye className="w-4 h-4" />
                            {paste.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {new Date(paste.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {paste.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/paste/${paste.id}`}>
                            <FiEye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}