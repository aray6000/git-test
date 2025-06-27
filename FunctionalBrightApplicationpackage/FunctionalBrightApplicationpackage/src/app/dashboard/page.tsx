"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiBarChart,
  FiCode,
  FiClock,
  FiEye,
  FiHeart,
  FiLock,
  FiPlus,
  FiSettings,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiCalendar,
  FiDownload,
  FiShare2,
  FiCopy,
  FiEdit3
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlitchText } from "@/components/ui/glitch-text";
import { AdBox } from "@/components/ui/ad-box";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllPastes } from "@/lib/paste-service";
import { getUserStats } from "@/lib/auth";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [userPastes, setUserPastes] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [timeFrame, setTimeFrame] = useState("week");

  // Get user's actual pastes from localStorage
  const getUserActualPastes = (userId: string) => {
    if (typeof window === 'undefined') return [];
    const allPastes = getAllPastes();
    return allPastes.filter(paste => paste.userId === userId);
  };

  // Calculate real stats
  const calculateRealStats = (userId: string) => {
    const userActualPastes = getUserActualPastes(userId);
    return {
      totalPastes: userActualPastes.length,
      totalViews: userActualPastes.reduce((sum, paste) => sum + (paste.views || 0), 0),
      publicPastes: userActualPastes.filter(paste => !paste.password).length,
      privatePastes: userActualPastes.filter(paste => paste.password).length,
      followers: JSON.parse(localStorage.getItem(`user-stats-${userId}`) || '{}').followers || 0
    };
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (user) {
      // Get user's actual pastes
      const userActualPastes = getUserActualPastes(user.id);
      setUserPastes(userActualPastes);

      // Get real user stats
      const realStats = calculateRealStats(user.id);
      setUserStats(realStats);

      // Create recent activity from actual pastes
      const activity = userActualPastes
        .sort((a, b) => b.created - a.created)
        .slice(0, 4)
        .map(paste => ({
          type: 'created',
          title: paste.title,
          time: formatTimeAgo(paste.created),
          views: paste.views || 0,
          language: paste.language
        }));

      setRecentActivity(activity);
    }
  }, [isAuthenticated, user, router]);

  // Refresh stats every 3 seconds for real-time updates
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const realStats = calculateRealStats(user.id);
      setUserStats(realStats);
      const userActualPastes = getUserActualPastes(user.id);
      setUserPastes(userActualPastes);
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // Listen for real-time stats updates
  useEffect(() => {
    if (!user) return;
    
    const handleStatsUpdate = () => {
      const realStats = calculateRealStats(user.id);
      setUserStats(realStats);
      const userActualPastes = getUserActualPastes(user.id);
      setUserPastes(userActualPastes);
    };

    window.addEventListener('stats-updated', handleStatsUpdate);
    window.addEventListener('global-stats-updated', handleStatsUpdate);

    return () => {
      window.removeEventListener('stats-updated', handleStatsUpdate);
      window.removeEventListener('global-stats-updated', handleStatsUpdate);
    };
  }, [user]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const getLanguageStats = () => {
    const languageCounts: Record<string, number> = {};
    userPastes.forEach(paste => {
      languageCounts[paste.language] = (languageCounts[paste.language] || 0) + 1;
    });

    const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
    return Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([language, count], index) => ({
        language,
        count,
        color: colors[index] || 'bg-gray-500'
      }));
  };

  const getWeeklyViews = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return days.map(day => {
      const views = userPastes
        .filter(paste => {
          const pasteDate = new Date(paste.created);
          return pasteDate >= weekAgo && pasteDate <= now;
        })
        .reduce((sum, paste) => sum + (paste.views || 0), 0);

      return { day, views: Math.floor(views / 7) }; // Average views per day
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const languageStats = getLanguageStats();
  const weeklyViews = getWeeklyViews();
  const topPastes = userPastes
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <GlitchText
            text="NEURAL DASHBOARD"
            as="h1"
            color="primary"
            intensity="medium"
            className="text-3xl md:text-4xl font-bold mb-2"
          />
          <p className="text-muted-foreground">
            Welcome back, {user.displayName}. Your cyber realm awaits.
          </p>
        </div>

        <div className="flex gap-3">
          <CyberpunkButton asChild variant="outline">
            <Link href="/new">
              <FiPlus className="w-4 h-4 mr-2" />
              New Paste
            </Link>
          </CyberpunkButton>
          <CyberpunkButton asChild>
            <Link href="/profile">
              <FiSettings className="w-4 h-4 mr-2" />
              Profile
            </Link>
          </CyberpunkButton>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="p-4 text-center">
            <FiCode className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{userStats?.totalPastes || 0}</div>
            <div className="text-xs text-muted-foreground">Total Pastes</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
          <CardContent className="p-4 text-center">
            <FiEye className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-secondary">{(userStats?.totalViews || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardContent className="p-4 text-center">
            <FiTrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">{userStats?.publicPastes || 0}</div>
            <div className="text-xs text-muted-foreground">Public Pastes</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <FiUsers className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{userStats?.followers || 0}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </CardContent>
        </Card>



        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30">
          <CardContent className="p-4 text-center">
            <FiZap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-500">{userStats?.privatePastes || 0}</div>
            <div className="text-xs text-muted-foreground">Private Pastes</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="top-pastes">Top Pastes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiActivity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <FiActivity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                      <p className="text-muted-foreground mb-4">Create your first paste to see activity here.</p>
                      <CyberpunkButton asChild>
                        <Link href="/new">Create First Paste</Link>
                      </CyberpunkButton>
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.type} • {activity.time} • {activity.views} views • {activity.language}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiZap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CyberpunkButton className="w-full justify-start" asChild>
                    <Link href="/new">
                      <FiPlus className="w-4 h-4 mr-2" />
                      Create New Paste
                    </Link>
                  </CyberpunkButton>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/recent">
                      <FiClock className="w-4 h-4 mr-2" />
                      Browse Recent Pastes
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/trending">
                      <FiTrendingUp className="w-4 h-4 mr-2" />
                      View Trending
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/profile">
                      <FiSettings className="w-4 h-4 mr-2" />
                      Manage Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Language Distribution */}
            {languageStats.length > 0 && (
              <Card className="bg-background/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FiBarChart className="w-5 h-5" />
                    Language Distribution
                  </CardTitle>
                  <CardDescription>Your most used programming languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {languageStats.map((lang, index) => (
                      <div key={lang.language} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${lang.color}`} />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{lang.language}</span>
                            <span className="text-sm text-muted-foreground">{lang.count} pastes</span>
                          </div>
                          <div className="w-full bg-background/50 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${lang.color}`}
                              style={{ width: `${Math.max((lang.count / Math.max(...languageStats.map(l => l.count))) * 100, 5)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-background/50 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiBarChart className="w-5 h-5" />
                  Weekly Views Analytics
                </CardTitle>
                <CardDescription>View statistics for your pastes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {weeklyViews.map((day, index) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t-sm flex items-end justify-center"
                        style={{ height: `${Math.max((day.views / Math.max(...weeklyViews.map(d => d.views), 1)) * 100, 5)}%` }}
                      >
                        <span className="text-xs font-medium text-primary mb-2">{day.views}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-background/50 border-border/30">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Your recent actions and interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <FiActivity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                    <p className="text-muted-foreground mb-4">Your activity will appear here as you create and interact with pastes.</p>
                    <CyberpunkButton asChild>
                      <Link href="/new">Create Your First Paste</Link>
                    </CyberpunkButton>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-background/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 text-green-500">
                        <FiPlus className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.type} "{activity.title}"</p>
                        <p className="text-sm text-muted-foreground">{activity.time} • {activity.views} views</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Pastes Tab */}
          <TabsContent value="top-pastes" className="space-y-6">
            <Card className="bg-background/50 border-border/30">
              <CardHeader>
                <CardTitle>Your Top Performing Pastes</CardTitle>
                <CardDescription>Most viewed pastes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPastes.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No pastes yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first paste to see it here.</p>
                    <CyberpunkButton asChild>
                      <Link href="/new">Create First Paste</Link>
                    </CyberpunkButton>
                  </div>
                ) : (
                  topPastes.map((paste, index) => (
                    <div key={paste.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/40 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{paste.title}</h4>
                          <Badge variant="outline">{paste.language}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FiEye className="w-4 h-4" />
                            {(paste.views || 0).toLocaleString()} views
                          </span>
                          <span>{formatTimeAgo(paste.created)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <FiShare2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FiDownload className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/paste/${paste.id}`}>
                            <FiEye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}