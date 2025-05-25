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

// Mock users database - in real app this would come from API
const mockUsersDb = [
  {
    id: "1",
    username: "neural_architect",
    displayName: "Neural Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Building the future with AI and neural networks. Passionate about modern web development and clean code architecture.",
    location: "San Francisco, CA",
    website: "https://neural-arch.dev",
    github: "neural-architect",
    joinDate: "2024-01-10",
    stats: {
      pastes: 89,
      views: 15234,
      followers: 567,
      following: 123,
      reputation: 2341
    },
    languages: ["Python", "TensorFlow", "JavaScript"],
    isFollowing: false,
    isOnline: true,
    publicProfile: true
  },
  {
    id: "2",
    username: "crypto_wizard",
    displayName: "Crypto Wizard",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c113?w=150&h=150&fit=crop&crop=face",
    bio: "Blockchain developer and cryptography enthusiast. Building secure decentralized applications and smart contracts.",
    location: "Austin, TX",
    website: "https://cryptowiz.io",
    github: "crypto-wizard",
    joinDate: "2024-02-15",
    stats: {
      pastes: 134,
      views: 23456,
      followers: 789,
      following: 234,
      reputation: 3456
    },
    languages: ["Solidity", "Rust", "Go"],
    isFollowing: true,
    isOnline: false,
    publicProfile: true
  },
  {
    id: "3",
    username: "quantum_coder",
    displayName: "Quantum Coder",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Quantum computing researcher and full-stack developer. Exploring the intersection of quantum mechanics and software engineering.",
    location: "Boston, MA",
    website: "https://quantumcode.dev",
    github: "quantum-coder",
    joinDate: "2023-12-20",
    stats: {
      pastes: 67,
      views: 8901,
      followers: 345,
      following: 89,
      reputation: 1789
    },
    languages: ["Q#", "Python", "C++"],
    isFollowing: false,
    isOnline: true,
    publicProfile: true
  }
];

// Mock user pastes
const mockUserPastes = [
  {
    id: "paste_1",
    title: "React Component Architecture",
    language: "typescript",
    views: 1234,
    createdAt: "2024-05-20",
    isPrivate: false,
    isExpired: false,
    tags: ["react", "typescript", "ui"]
  },
  {
    id: "paste_2",
    title: "Authentication Middleware",
    language: "javascript",
    views: 856,
    createdAt: "2024-05-18",
    isPrivate: false,
    isExpired: false,
    tags: ["security", "middleware", "javascript"]
  },
  {
    id: "paste_3",
    title: "Data Processing Pipeline",
    language: "python",
    views: 2341,
    createdAt: "2024-05-15",
    isPrivate: false,
    isExpired: false,
    tags: ["python", "data", "analytics"]
  }
];

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [user, setUser] = useState<typeof mockUsersDb[0] | null>(null);
  const [userPastes, setUserPastes] = useState(mockUserPastes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find user by username
    const foundUser = mockUsersDb.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
    }
    setLoading(false);
  }, [username]);

  const handleFollow = () => {
    if (!user) return;

    setUser(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      stats: {
        ...prev.stats,
        followers: prev.isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
      }
    }));

    toast.success(
      user.isFollowing
        ? `Unfollowed ${user.displayName}`
        : `Now following ${user.displayName}`
    );
  };

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
    <div className="space-y-8 max-w-6xl mx-auto">
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
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
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

        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1">{user.stats.reputation}</div>
            <div className="text-sm text-muted-foreground">Reputation</div>
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
