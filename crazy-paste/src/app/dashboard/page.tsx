"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiBarChart3,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlitchText } from "@/components/ui/glitch-text";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for the dashboard
const mockDashboardData = {
  user: {
    name: "Cyberpunk Dev",
    username: "cyberpunk_dev",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    joinDate: "2024-01-15"
  },
  stats: {
    totalPastes: 147,
    totalViews: 12543,
    weeklyViews: 2341,
    followers: 234,
    reputation: 1567,
    streak: 12
  },
  recentActivity: [
    { type: "created", title: "Advanced React Hooks", time: "2 hours ago", views: 45 },
    { type: "updated", title: "Crypto Utils Library", time: "5 hours ago", views: 123 },
    { type: "starred", title: "Neural Network Implementation", time: "1 day ago", views: 567 },
    { type: "forked", title: "Blockchain Validator", time: "2 days ago", views: 234 }
  ],
  topPastes: [
    { id: "1", title: "React Cyberpunk Components", language: "typescript", views: 2341, stars: 89, comments: 23 },
    { id: "2", title: "Quantum Encryption Library", language: "javascript", views: 1876, stars: 67, comments: 15 },
    { id: "3", title: "Neural Network Training Script", language: "python", views: 1543, stars: 45, comments: 32 },
    { id: "4", title: "Blockchain Smart Contract", language: "solidity", views: 1234, stars: 34, comments: 18 }
  ],
  analytics: {
    weeklyViews: [
      { day: "Mon", views: 234 },
      { day: "Tue", views: 345 },
      { day: "Wed", views: 567 },
      { day: "Thu", views: 432 },
      { day: "Fri", views: 678 },
      { day: "Sat", views: 543 },
      { day: "Sun", views: 456 }
    ],
    languageStats: [
      { language: "TypeScript", count: 45, color: "bg-blue-500" },
      { language: "JavaScript", count: 38, color: "bg-yellow-500" },
      { language: "Python", count: 32, color: "bg-green-500" },
      { language: "Rust", count: 18, color: "bg-orange-500" },
      { language: "Go", count: 14, color: "bg-purple-500" }
    ]
  }
};

export default function DashboardPage() {
  const [timeFrame, setTimeFrame] = useState("week");

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
            Welcome back, {mockDashboardData.user.name}. Your cyber realm awaits.
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
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="p-4 text-center">
            <FiCode className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">{mockDashboardData.stats.totalPastes}</div>
            <div className="text-xs text-muted-foreground">Total Pastes</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
          <CardContent className="p-4 text-center">
            <FiEye className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold text-secondary">{mockDashboardData.stats.totalViews.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardContent className="p-4 text-center">
            <FiTrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold text-accent">{mockDashboardData.stats.weeklyViews.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <FiUsers className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-yellow-500">{mockDashboardData.stats.followers}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
          <CardContent className="p-4 text-center">
            <FiStar className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-500">{mockDashboardData.stats.reputation}</div>
            <div className="text-xs text-muted-foreground">Reputation</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-orange-500/30">
          <CardContent className="p-4 text-center">
            <FiZap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-500">{mockDashboardData.stats.streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
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
                  {mockDashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'created' ? 'bg-green-500' :
                          activity.type === 'updated' ? 'bg-blue-500' :
                          activity.type === 'starred' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type} • {activity.time} • {activity.views} views
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
            <Card className="bg-background/50 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiBarChart3 className="w-5 h-5" />
                  Language Distribution
                </CardTitle>
                <CardDescription>Your most used programming languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDashboardData.analytics.languageStats.map((lang, index) => (
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
                            style={{ width: `${(lang.count / 45) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-background/50 border-border/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiBarChart3 className="w-5 h-5" />
                  Weekly Views Analytics
                </CardTitle>
                <CardDescription>View statistics for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {mockDashboardData.analytics.weeklyViews.map((day, index) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t-sm flex items-end justify-center"
                        style={{ height: `${(day.views / 700) * 100}%` }}
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
                {mockDashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-background/30 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'created' ? 'bg-green-500/20 text-green-500' :
                      activity.type === 'updated' ? 'bg-blue-500/20 text-blue-500' :
                      activity.type === 'starred' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-purple-500/20 text-purple-500'
                    }`}>
                      {activity.type === 'created' && <FiPlus className="w-4 h-4" />}
                      {activity.type === 'updated' && <FiEdit3 className="w-4 h-4" />}
                      {activity.type === 'starred' && <FiStar className="w-4 h-4" />}
                      {activity.type === 'forked' && <FiCopy className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.type} "{activity.title}"</p>
                      <p className="text-sm text-muted-foreground">{activity.time} • {activity.views} views</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Pastes Tab */}
          <TabsContent value="top-pastes" className="space-y-6">
            <Card className="bg-background/50 border-border/30">
              <CardHeader>
                <CardTitle>Your Top Performing Pastes</CardTitle>
                <CardDescription>Most viewed and starred pastes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockDashboardData.topPastes.map((paste, index) => (
                  <div key={paste.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg hover:bg-background/40 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{paste.title}</h4>
                        <Badge variant="outline">{paste.language}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FiEye className="w-4 h-4" />
                          {paste.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center gap-1">
                          <FiStar className="w-4 h-4" />
                          {paste.stars} stars
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart className="w-4 h-4" />
                          {paste.comments} comments
                        </span>
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
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
