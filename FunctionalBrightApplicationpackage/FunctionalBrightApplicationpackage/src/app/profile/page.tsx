"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GlitchText } from "@/components/ui/glitch-text";
import { AdBox } from "@/components/ui/ad-box";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats } from "@/hooks/use-user-stats";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiEdit3,
  FiSettings,
  FiCode,
  FiEye,
  FiClock,
  FiLock,
  FiTrash2,
  FiCopy,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiStar,
  FiShield,
  FiGithub,
  FiMail,
  FiGlobe,
  FiUsers,
  FiMessageSquare,
  FiSend
} from "react-icons/fi";
import { RoleBadge } from "@/components/ui/role-badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { toast } from "sonner";
import Link from "next/link";
import { useLiveViews } from "@/hooks/use-live-views";
import { updateUserInDatabase } from "@/lib/auth";

// Mock useLiveView hook for individual paste
const useLiveView = (pasteId: string) => {
  return { isConnected: true, liveViewCount: Math.floor(Math.random() * 5) };
};

// Get user's actual pastes from localStorage
const getUserPastes = (userId: string) => {
  if (typeof window === 'undefined') return [];

  const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
  return allPastes.filter((paste: any) => paste.userId === userId);
};

export default function ProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { totalPastes, publicPastes, privatePastes, totalViews, followers, following, refreshStats } = useUserStats(authUser?.id || null);

  // Listen for real-time stats updates
  useEffect(() => {
    const handleStatsUpdate = () => {
      refreshStats();
    };

    window.addEventListener('stats-updated', handleStatsUpdate);
    window.addEventListener('global-stats-updated', handleStatsUpdate);

    return () => {
      window.removeEventListener('stats-updated', handleStatsUpdate);
      window.removeEventListener('global-stats-updated', handleStatsUpdate);
    };
  }, [refreshStats]);
  const router = useRouter();
  const [user, setUser] = useState(authUser);
  const [userPastes, setUserPastes] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: authUser?.profile?.firstName || '',
    lastName: authUser?.profile?.lastName || '',
    displayName: authUser?.displayName || '',
    bio: authUser?.bio || '',
    location: authUser?.location || '',
    website: authUser?.website || '',
    github: authUser?.github || '',
    discord: authUser?.discord || '',
    telegram: authUser?.telegram || '',
    twitter: authUser?.twitter || ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    if (authUser) {
      console.log('Loading profile for user:', authUser.username);
      
      // Load from contact storage system first
      const contactStorageKey = `profile-storage-${authUser.id}`;
      const contactStorage = localStorage.getItem(contactStorageKey);
      let profileData = {};

      if (contactStorage) {
        try {
          const parsed = JSON.parse(contactStorage);
          profileData = parsed.profileData || {};
          console.log('Loaded profile data from storage:', profileData);
        } catch (error) {
          console.error('Error parsing contact storage:', error);
        }
      }

      // Merge stored profile data with auth user data
      const mergedUser = {
        ...authUser,
        displayName: profileData.displayName || authUser.displayName || authUser.username,
        bio: profileData.bio || authUser.bio || authUser.profile?.bio || 'Welcome to CrazyPaste!',
        location: profileData.location || authUser.location || authUser.profile?.location || '',
        website: profileData.website || authUser.website || authUser.profile?.website || '',
        github: profileData.github || authUser.github || authUser.profile?.github || '',
        discord: profileData.discord || authUser.discord || '',
        telegram: profileData.telegram || authUser.telegram || '',
        twitter: profileData.twitter || authUser.twitter || '',
        profile: {
          ...authUser.profile,
          ...profileData,
          firstName: profileData.firstName || authUser.profile?.firstName || '',
          lastName: profileData.lastName || authUser.profile?.lastName || ''
        }
      };

      console.log('Merged user data:', mergedUser);
      setUser(mergedUser);
      
      setEditForm({
        firstName: profileData.firstName || authUser.profile?.firstName || '',
        lastName: profileData.lastName || authUser.profile?.lastName || '',
        displayName: profileData.displayName || authUser.displayName || authUser.username,
        bio: profileData.bio || authUser.bio || authUser.profile?.bio || 'Welcome to CrazyPaste!',
        location: profileData.location || authUser.location || authUser.profile?.location || '',
        website: profileData.website || authUser.website || authUser.profile?.website || '',
        github: profileData.github || authUser.github || authUser.profile?.github || '',
        discord: profileData.discord || authUser.discord || '',
        telegram: profileData.telegram || authUser.telegram || '',
        twitter: profileData.twitter || authUser.twitter || ''
      });

      // Load user's actual pastes
      const pastes = getUserPastes(authUser.id);
      console.log('User pastes loaded:', pastes.length);
      setUserPastes(pastes);

      // Refresh stats when profile loads
      refreshStats();
    }
  }, [isAuthenticated, authUser, router, refreshStats]);

  // Refresh stats every 2 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(refreshStats, 2000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  // Also refresh when user's pastes change
  useEffect(() => {
    const handlePasteChange = () => {
      if (authUser?.id) {
        const pastes = getUserPastes(authUser.id);
        setUserPastes(pastes);
        refreshStats();
      }
    };

    window.addEventListener('paste-created', handlePasteChange);
    window.addEventListener('paste-updated', handlePasteChange);

    return () => {
      window.removeEventListener('paste-created', handlePasteChange);
      window.removeEventListener('paste-updated', handlePasteChange);
    };
  }, [authUser?.id, refreshStats]);

  // Show loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const updatedUser = {
        ...user,
        displayName: editForm.displayName || user.displayName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        github: editForm.github,
        discord: editForm.discord,
        telegram: editForm.telegram,
        twitter: editForm.twitter,
        profile: {
          ...user.profile,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          github: editForm.github
        },
        updatedAt: new Date().toISOString()
      };

      // Save to contact storage system
      const contactStorageKey = `profile-storage-${user.id}`;
      const contactStorage = {
        profileData: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          displayName: editForm.displayName,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          github: editForm.github,
          discord: editForm.discord,
          telegram: editForm.telegram,
          twitter: editForm.twitter
        },
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      localStorage.setItem(contactStorageKey, JSON.stringify(contactStorage));

      // Update current user in localStorage
      localStorage.setItem('crazy-paste-current-user', JSON.stringify(updatedUser));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update in user database
      if (!user.isGuest) {
        updateUserInDatabase(user.id, {
          ...updatedUser,
          profile: updatedUser.profile
        });

        // Update the main user database
        const userDatabase = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
        if (userDatabase.users) {
          userDatabase.users = userDatabase.users.map((u: any) => 
            u.id === user.id ? { ...u, ...updatedUser, profile: updatedUser.profile } : u
          );
          localStorage.setItem('crazy-paste-user-database', JSON.stringify(userDatabase));
        }

        // Also update the stored users array
        const storedUsers = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
        const updatedUsers = storedUsers.map((u: any) => 
          u.id === user.id ? { ...u, ...updatedUser, profile: updatedUser.profile } : u
        );
        localStorage.setItem('crazy-paste-users', JSON.stringify(updatedUsers));
      }

      // Update contact info for paste service compatibility
      const userContactKey = `user-contact-${user.id}`;
      localStorage.setItem(userContactKey, JSON.stringify({
        website: editForm.website,
        github: editForm.github,
        discord: editForm.discord,
        telegram: editForm.telegram,
        twitter: editForm.twitter,
        lastUpdated: new Date().toISOString()
      }));

      // Update state immediately
      setUser(updatedUser);
      setIsEditing(false);

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setUser(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
    toast.success("Settings updated!");
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setUser(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings.notifications,
          [key]: value
        }
      }
    }));
    toast.success("Notification preferences updated!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.")) {
      if (window.confirm("This will permanently delete your account, all your pastes, and all associated data. Type 'DELETE' to confirm.")) {
        // Use the proper database deletion function
        if (authUser?.id) {
          // Import the deleteUserFromDatabase function
          const { deleteUserFromDatabase } = require('@/lib/auth');

          // Delete user from main database (this will handle all cleanup)
          const deleted = deleteUserFromDatabase(authUser.id);
          if (deleted) {
            // Remove all user's pastes
            const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
            const updatedPastes = allPastes.filter((paste: any) => paste.userId !== authUser.id);
            localStorage.setItem('crazy-paste-pastes', JSON.stringify(updatedPastes));

            toast.success("Account deleted successfully. You will be redirected to the home page.");

            // Redirect to home page after a short delay
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            toast.error("Failed to delete account. Please try again.");
          }
        } else {
          toast.error("User not found.");
        }
      }
    }
  };

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        displayName: user.displayName || '',
        bio: user.profile?.bio || user.bio || '',
        location: user.profile?.location || user.location || '',
        website: user.profile?.website || user.website || '',
        github: user.profile?.github || user.github || '',
        discord: user.discord || user.discord || '',
        telegram: user.profile?.telegram || user.telegram || '',
        twitter: user.profile?.twitter || user.twitter || ''
      });
    }
  }, [user]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="bg-background/50 border-border/30">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={user.avatar || user.profile?.avatar} alt={user.displayName || user.username} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                    {(user?.displayName || user?.username)?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>
                  <GlitchText text={user.displayName || user.username || 'Unknown User'} color="primary" intensity="low" />
                </CardTitle>
                <p className="text-muted-foreground">
                  @{user.username}
                </p>
                <div className="mt-2">
                  <RoleBadge role={user.role} />
                </div>

                <p className="text-sm text-muted-foreground mt-4 text-center">
                  {user.bio || user.profile?.bio || "Welcome to CrazyPaste!"}
                </p>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      Joined {new Date(user.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiActivity className="w-4 h-4" />
                    <span>
                      Last active {new Date(user.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2">
                      <FiGlobe className="w-4 h-4" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                  {user.github && (
                    <div className="flex items-center gap-2">
                      <FiGithub className="w-4 h-4" />
                      <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        GitHub
                      </a>
                    </div>
                  )}
                  {user.discord && (
                    <div className="flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4" />
                      <a href={user.discord} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Discord
                      </a>
                    </div>
                  )}
                  {user.telegram && (
                    <div className="flex items-center gap-2">
                      <FiSend className="w-4 h-4" />
                      <a href={user.telegram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Telegram
                      </a>
                    </div>
                  )}
                  {user.twitter && (
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        X (Twitter)
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="flex-1">
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel" : "Contact"}
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/dashboard">
                    <FiSettings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Card className="bg-background/50 border-border/30 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{totalPastes || 0}</div>
              <div className="text-sm text-muted-foreground">Total Pastes</div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/30 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-secondary">{(totalViews || 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/30 text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-accent">{followers || 0}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="pastes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pastes">
                <FiCode className="w-4 h-4 mr-2" />
                Pastes
              </TabsTrigger>
              <TabsTrigger value="activity">
                <FiActivity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="contact">
                <FiUser className="w-4 h-4 mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="settings">
                <FiSettings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pastes" className="space-y-4">
              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle>
                    My Pastes
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      Public: {publicPastes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiLock className="w-4 h-4" />
                      Private: {privatePastes}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {userPastes.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCode className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pastes yet</h3>
                      <p className="text-muted-foreground mb-4">You haven't created any pastes yet.</p>
                      <Button asChild>
                        <Link href="/new">Create Your First Paste</Link>
                      </Button>
                    </div>
                  ) : (
                    userPastes.map((paste, index) => {
                      const { isConnected, liveViewCount } = useLiveView(paste.id);
                      return (
                        <Card key={paste.id} className="mb-4 bg-muted/30 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-primary">
                                    {paste.title}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    {paste.password ? <FiLock className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                                    <span className="text-xs text-muted-foreground">
                                      {paste.password ? "Private" : "Public"}
                                    </span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {paste.language}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FiEye className="w-3 h-3" />
                                    {paste.views} views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FiClock className="w-3 h-3" />
                                    {new Date(paste.created).toLocaleDateString()}
                                  </span>
                                  {isConnected && liveViewCount > 0 && (
                                    <span className="flex items-center gap-1 text-green-500">
                                      <FiUsers className="w-3 h-3" />
                                      {liveViewCount} live
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/paste/${paste.id}`}>
                                    <FiEye className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <FiCopy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <FiEdit3 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <FiTrash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPastes.length === 0 ? (
                    <div className="text-center py-8">
                      <FiActivity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                      <p className="text-muted-foreground mb-4">Your recent activity will appear here as you create and interact with pastes.</p>
                      <Button asChild>
                        <Link href="/new">Create Your First Paste</Link>
                      </Button>
                    </div>
                  ) : (
                    userPastes
                      .sort((a, b) => b.created - a.created)
                      .slice(0, 10)
                      .map((paste, index) => {
                        const timeAgo = () => {
                          const now = Date.now();
                          const diff = now - paste.created;
                          const minutes = Math.floor(diff / (1000 * 60));
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

                          if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
                          if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                          if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
                          return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
                        };

                        return (
                          <div key={paste.id} className="flex items-start gap-3 p-3 border-b border-border/30 last:border-b-0">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <FiCode className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Created</span>
                                <Link href={`/paste/${paste.id}`} className="text-primary hover:underline">
                                  "{paste.title}"
                                </Link>
                                <Badge variant="outline" className="text-xs">
                                  {paste.language}
                                </Badge>
                                {paste.password && (
                                  <Badge variant="secondary" className="text-xs">
                                    <FiLock className="w-3 h-3 mr-1" />
                                    Private
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <FiEye className="w-3 h-3" />
                                  {paste.views} views
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiClock className="w-3 h-3" />
                                  {timeAgo()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              {isEditing ? (
                <Card className="bg-background/50 border-border/30">
                  <CardHeader>
                    <CardTitle>
                      Edit Contact Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Update your contact details and social media links
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={editForm.website}
                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github">GitHub Username</Label>
                      <Input
                        id="github"
                        value={editForm.github}
                        onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discord">Discord Server Link</Label>
                      <Input
                        id="discord"
                        value={editForm.discord}
                        onChange={(e) => setEditForm(prev => ({ ...prev, discord: e.target.value }))}
                        placeholder="https://discord.gg/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="telegram">Telegram Link</Label>
                      <Input
                        id="telegram"
                        value={editForm.telegram}
                        onChange={(e) => setEditForm(prev => ({ ...prev, telegram: e.target.value }))}
                        placeholder="https://t.me/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">X (Twitter) Profile</Label>
                      <Input
                        id="twitter"
                        value={editForm.twitter}
                        onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                        placeholder="https://x.com/username"
                      />
                    </div>
                    <div className="flex gap-2">
                      <CyberpunkButton onClick={handleSaveProfile} glitchOnHover>
                        Save Changes
                      </CyberpunkButton>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="bg-background/50 border-border/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiUser className="w-5 h-5" />
                        <GlitchText text={`Contact ${user.displayName}`} color="primary" intensity="low" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Get in touch through available channels
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          {user.website && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <FiGlobe className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">Website</h4>
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  {user.website}
                                </a>
                              </div>
                            </div>
                          )}

                          {user.github && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <FiGithub className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">GitHub</h4>
                                <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  @{user.github}
                                </a>
                              </div>
                            </div>
                          )}

                          {user.discord && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <FiMessageSquare className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">Discord</h4>
                                <a href={user.discord} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  Join Server
                                </a>
                              </div>
                            </div>
                          )}

                          {user.telegram && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <FiSend className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">Telegram</h4>
                                <a href={user.telegram} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  Message on Telegram
                                </a>
                              </div>
                            </div>
                          )}

                          {user.twitter && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                              <FiMail className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <h4 className="font-medium">X (Twitter)</h4>
                                <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  Follow on X
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {!user.website && !user.github && !user.discord && !user.telegram && !user.twitter && !user.profile?.website && !user.profile?.github && (
                          <div className="text-center py-8">
                            <FiUser className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No contact information available</h3>
                            <p className="text-muted-foreground">
                              {user.displayName || user.username} hasn't shared any contact details yet.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                            <FiEdit3 className="w-4 h-4 mr-2" />
                            Edit Contact Info
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <FiMail className="w-4 h-4 mr-2" />
                            General Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-background/50 border-border/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FiStar className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Common ways to connect and collaborate
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <FiUsers className="w-4 h-4 mr-2" />
                        Follow User
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FiStar className="w-4 h-4 mr-2" />
                        Star Favorite Pastes
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FiCode className="w-4 h-4 mr-2" />
                        Fork Public Pastes
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FiShield className="w-4 h-4 mr-2" />
                        Report User
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiSettings className="w-5 h-5" />
                    Privacy Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Control your profile visibility and privacy
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Public Profile</h4>
                      <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      checked={user.settings?.publicProfile ?? true}
                      onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Email</h4>
                      <p className="text-sm text-muted-foreground">Display email address on profile</p>
                    </div>
                    <Switch
                      checked={user.settings?.showEmail ?? false}
                      onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Follows</h4>
                      <p className="text-sm text-muted-foreground">Let other users follow your activity</p>
                    </div>
                    <Switch
                      checked={user.settings?.allowFollows ?? true}
                      onCheckedChange={(checked) => handleSettingChange('allowFollows', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiActivity className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to be notified
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={user.settings?.notifications?.email ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Browser Notifications</h4>
                      <p className="text-sm text-muted-foreground">Show browser push notifications</p>
                    </div>
                    <Switch
                      checked={user.settings?.notifications?.browser ?? false}
                      onCheckedChange={(checked) => handleNotificationChange('browser', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Followers</h4>
                      <p className="text-sm text-muted-foreground">Notify when someone follows you</p>
                    </div>
                    <Switch
                      checked={user.settings?.notifications?.followers ?? true}
                      onCheckedChange={(checked) => handleNotificationChange('followers', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Digest</h4>
                      <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={user.settings?.notifications?.digest ?? false}
                      onCheckedChange={(checked) => handleNotificationChange('digest', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/30 border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <FiTrash2 className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Irreversible and destructive actions
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="w-full"
                  >
                    <FiTrash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}