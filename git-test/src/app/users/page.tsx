
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiUser,
  FiUsers,
  FiEye,
  FiCode,
  FiStar,
  FiUserPlus,
  FiUserMinus,
  FiFilter,
  FiMapPin,
  FiCalendar,
  FiGithub,
  FiGlobe,
  FiTrendingUp,
  FiActivity
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlitchText } from "@/components/ui/glitch-text";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { toast } from "sonner";
import Link from "next/link";
import { getStoredUsers } from "@/lib/auth";

interface UserProfile {
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
  stats: {
    pastes: number;
    views: number;
    followers: number;
    following: number;
    reputation: number;
  };
  languages: string[];
  isFollowing: boolean;
  isOnline: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("reputation");
  const [filterBy, setFilterBy] = useState("all");
  const [loading, setLoading] = useState(true);

  // Get real users from localStorage
  const getRealUsers = () => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
  };

  // Get user stats from localStorage
  const getUserStats = (userId: string) => {
    if (typeof window === 'undefined') return { totalPastes: 0, totalViews: 0, followers: 0, reputation: 0 };
    const userStatsKey = `user-stats-${userId}`;
    const stats = JSON.parse(localStorage.getItem(userStatsKey) || '{}');
    return {
      totalPastes: stats.totalPastes || 0,
      totalViews: stats.totalViews || 0,
      followers: stats.followers || 0,
      reputation: stats.reputation || 0
    };
  };

  useEffect(() => {
    // Load registered users from localStorage
    const registeredUsers = getStoredUsers();

    // Transform auth users to user profiles with default values
    const userProfiles: UserProfile[] = registeredUsers.map(user => {
      // Use stored username
      const username = user.username;
      const displayName = username.charAt(0).toUpperCase() + username.slice(1); // Capitalize first letter

      return {
        id: user.id,
        email: user.email,
        username: username,
        displayName: displayName, // Use actual username
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`, // Generate avatar
        bio: "New member of the Crazy Paste community",
        location: "",
        website: "",
        github: "",
        joinDate: user.createdAt,
        stats: {
          pastes: getUserStats(user.id).totalPastes,
          views: getUserStats(user.id).totalViews,
          followers: getUserStats(user.id).followers,
          following: 0, // Default value
          reputation: getUserStats(user.id).reputation
        },
        languages: ["JavaScript", "TypeScript"], // Default languages
        isFollowing: false,
        isOnline: Math.random() > 0.5 // Random online status
      };
    });

    setUsers(userProfiles);
    setLoading(false);
  }, []);

  const handleFollow = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? {
            ...user,
            isFollowing: !user.isFollowing,
            stats: {
              ...user.stats,
              followers: user.isFollowing ? user.stats.followers - 1 : user.stats.followers + 1
            }
          }
        : user
    ));

    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(
        user.isFollowing
          ? `Unfollowed ${user.displayName}`
          : `Now following ${user.displayName}`
      );
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = filterBy === "all" ||
                           (filterBy === "following" && user.isFollowing) ||
                           (filterBy === "online" && user.isOnline);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "reputation": return b.stats.reputation - a.stats.reputation;
        case "followers": return b.stats.followers - a.stats.followers;
        case "pastes": return b.stats.pastes - a.stats.pastes;
        case "views": return b.stats.views - a.stats.views;
        case "newest": return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        default: return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
          Registered Members
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover and connect with registered developers, programmers, and code enthusiasts in our community.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users by name, username, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reputation">Reputation</SelectItem>
            <SelectItem value="followers">Followers</SelectItem>
            <SelectItem value="pastes">Pastes</SelectItem>
            <SelectItem value="views">Views</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="following">Following</SelectItem>
            <SelectItem value="online">Online</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="bg-background/50 border-border/30">
          <CardContent className="p-4 text-center">
            <FiUsers className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-xs text-muted-foreground">Registered Users</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30">
          <CardContent className="p-4 text-center">
            <FiActivity className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-secondary">{users.filter(u => u.isOnline).length}</div>
            <div className="text-xs text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30">
          <CardContent className="p-4 text-center">
            <FiUserPlus className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">{users.filter(u => u.isFollowing).length}</div>
            <div className="text-xs text-muted-foreground">Following</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30">
          <CardContent className="p-4 text-center">
            <FiCode className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{users.reduce((sum, u) => sum + u.stats.pastes, 0)}</div>
            <div className="text-xs text-muted-foreground">Total Pastes</div>
          </CardContent>
        </Card>
      </motion.div>

      {users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FiUsers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No registered users yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to join our community!
          </p>
          <Button asChild>
            <Link href="/auth">Sign Up</Link>
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Users Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-background/30 border-border/30 hover:bg-background/50 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-primary/30">
                            <AvatarImage src={user.avatar} alt={user.displayName} />
                            <AvatarFallback>{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.displayName}</h3>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>

                      <CyberpunkButton
                        size="sm"
                        variant={user.isFollowing ? "outline" : "default"}
                        onClick={() => handleFollow(user.id)}
                        className="shrink-0"
                      >
                        {user.isFollowing ? (
                          <>
                            <FiUserMinus className="w-4 h-4 mr-1" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <FiUserPlus className="w-4 h-4 mr-1" />
                            Follow
                          </>
                        )}
                      </CyberpunkButton>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{user.bio}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        Joined {new Date(user.joinDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.languages.slice(0, 3).map(lang => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className="font-semibold text-primary">{user.stats.pastes}</div>
                        <div className="text-muted-foreground">Pastes</div>
                      </div>
                      <div>
                        <div className="font-semibold text-secondary">{user.stats.views.toLocaleString()}</div>
                        <div className="text-muted-foreground">Views</div>
                      </div>
                      <div>
                        <div className="font-semibold text-accent">{user.stats.followers}</div>
                        <div className="text-muted-foreground">Followers</div>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-500">{user.stats.reputation}</div>
                        <div className="text-muted-foreground">Rep</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                      <div className="flex gap-2">
                        {user.website && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={user.website} target="_blank" rel="noopener noreferrer">
                              <FiGlobe className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {user.github && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer">
                              <FiGithub className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/users/${user.username}`}>
                          <FiEye className="w-4 h-4 mr-1" />
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FiUsers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters.
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
