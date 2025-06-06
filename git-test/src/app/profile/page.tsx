"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  FiGlobe
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { GlitchText } from "@/components/ui/glitch-text";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { toast } from "sonner";
import Link from "next/link";

// Get user's actual pastes from localStorage
const getUserPastes = (userId: string) => {
  if (typeof window === 'undefined') return [];
  
  const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
  return allPastes.filter((paste: any) => paste.userId === userId);
};

export default function ProfilePage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const { stats, refreshStats } = useUserStats(authUser?.id || null);
  const router = useRouter();
  const [user, setUser] = useState(authUser);
  const [userPastes, setUserPastes] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: authUser?.displayName || '',
    bio: authUser?.bio || '',
    website: authUser?.website || '',
    github: authUser?.github || ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    if (authUser) {
      setUser(authUser);
      setEditForm({
        displayName: authUser.displayName,
        bio: authUser.bio || '',
        website: authUser.website || '',
        github: authUser.github || ''
      });
      
      // Load user's actual pastes
      const pastes = getUserPastes(authUser.id);
      setUserPastes(pastes);
    }
  }, [isAuthenticated, authUser, router]);

  // Refresh stats every 5 seconds
  useEffect(() => {
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handleSaveProfile = () => {
    setUser(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
    toast.success("Profile updated successfully!");
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
        // Clear all user data from localStorage
        if (authUser?.id) {
          // Remove user stats
          localStorage.removeItem(`user-stats-${authUser.id}`);
          
          // Remove from users list
          const users = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
          const updatedUsers = users.filter((u: any) => u.id !== authUser.id);
          localStorage.setItem('crazy-paste-users', JSON.stringify(updatedUsers));
          
          // Remove all user's pastes
          const allPastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
          const updatedPastes = allPastes.filter((paste: any) => paste.userId !== authUser.id);
          localStorage.setItem('crazy-paste-pastes', JSON.stringify(updatedPastes));
          
          // Clear current user session
          localStorage.removeItem('currentUser');
          localStorage.removeItem('crazy-paste-current-user');
        }
        
        toast.success("Account deleted successfully. You will be redirected to the home page.");
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    }
  };

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
            <Avatar className="w-24 h-24 border-2 border-primary/50">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-2xl bg-primary/20">
                {user.displayName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <GlitchText
                  text={user.displayName}
                  as="h1"
                  color="primary"
                  intensity="low"
                  className="text-3xl font-bold"
                />
                <Badge variant="secondary" className="bg-primary/20">
                  @{user.username}
                </Badge>
              </div>

              <p className="text-muted-foreground mb-4 max-w-2xl">{user.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <FiActivity className="w-4 h-4" />
                  Last active {new Date(user.lastActive).toLocaleDateString()}
                </div>
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
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <FiEdit3 className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </CyberpunkButton>

              <CyberpunkButton asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <FiActivity className="w-4 h-4" />
                  Dashboard
                </Link>
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
            <div className="text-2xl font-bold text-primary mb-1">{stats?.totalPastes || 0}</div>
            <div className="text-sm text-muted-foreground">Total Pastes</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1">{stats?.totalViews?.toLocaleString() || 0}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">{stats?.followers || 0}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1">{stats?.reputation || 0}</div>
            <div className="text-sm text-muted-foreground">Reputation</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="pastes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border/30">
            <TabsTrigger value="pastes" className="flex items-center gap-2">
              <FiCode className="w-4 h-4" />
              Pastes
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <FiActivity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!isEditing}>
              <FiEdit3 className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <FiSettings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pastes Tab */}
          <TabsContent value="pastes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">My Pastes</h3>
              <div className="flex gap-2">
                <Badge variant="outline">{user.stats.publicPastes}</Badge>
                <Badge variant="outline">{user.stats.privatePastes}</Badge>
              </div>
            </div>

            <div className="grid gap-4">
              {userPastes.length === 0 ? (
                <div className="text-center py-8">
                  <FiCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No pastes yet</h3>
                  <p className="text-muted-foreground mb-4">You haven't created any pastes yet.</p>
                  <CyberpunkButton asChild>
                    <Link href="/new">Create Your First Paste</Link>
                  </CyberpunkButton>
                </div>
              ) : (
                userPastes.map((paste, index) => (
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
                            <Badge variant={paste.password ? "destructive" : "secondary"}>
                              {paste.password ? <FiLock className="w-3 h-3 mr-1" /> : <FiEye className="w-3 h-3 mr-1" />}
                              {paste.password ? "Private" : "Public"}
                            </Badge>
                            <Badge variant="outline">{paste.language}</Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <FiEye className="w-4 h-4" />
                              {paste.views || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-4 h-4" />
                              {new Date(paste.created).toLocaleDateString()}
                            </span>
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
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "Created", target: "React Cyberpunk Component", time: "2 hours ago", icon: FiCode },
                { action: "Updated", target: "Secure Encryption Function", time: "1 day ago", icon: FiEdit3 },
                { action: "Starred", target: "Python Data Analysis Script", time: "3 days ago", icon: FiStar },
                { action: "Followed", target: "@neural_network_dev", time: "1 week ago", icon: FiUser }
              ].map((activity, index) => (
                <Card key={index} className="bg-background/30 border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <activity.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-primary">{activity.target}</span>
                      <span className="text-muted-foreground ml-auto">{activity.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card className="bg-background/30 border-border/30">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="mt-1"
                    placeholder="https://your-website.com"
                  />
                </div>

                <div>
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
                    id="github"
                    value={editForm.github}
                    onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                    className="mt-1"
                    placeholder="your-github-username"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <CyberpunkButton onClick={handleSaveProfile}>
                    Save Changes
                  </CyberpunkButton>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-background/30 border-border/30">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your profile visibility and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={user.settings.publicProfile}
                    onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display email address on profile</p>
                  </div>
                  <Switch
                    checked={user.settings.showEmail}
                    onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Follows</Label>
                    <p className="text-sm text-muted-foreground">Let other users follow your activity</p>
                  </div>
                  <Switch
                    checked={user.settings.allowFollows}
                    onCheckedChange={(checked) => handleSettingChange('allowFollows', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/30 border-border/30">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={user.settings.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show browser push notifications</p>
                  </div>
                  <Switch
                    checked={user.settings.notifications.browser}
                    onCheckedChange={(checked) => handleNotificationChange('browser', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Followers</Label>
                    <p className="text-sm text-muted-foreground">Notify when someone follows you</p>
                  </div>
                  <Switch
                    checked={user.settings.notifications.newFollower}
                    onCheckedChange={(checked) => handleNotificationChange('newFollower', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                  </div>
                  <Switch
                    checked={user.settings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/30 border-border/30 border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}