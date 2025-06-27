"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { GlitchText } from '@/components/ui/glitch-text';
import { FiUsers, FiShield, FiSettings, FiSearch, FiUserPlus, FiSave } from 'react-icons/fi';
import { UserRole, ROLE_FEATURES, ROLE_HIERARCHY } from '@/lib/types';
import { upgradeUsersToFunRole } from '@/lib/auth';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  joinDate: string;
  lastActive: string;
  totalPastes: number;
}

export default function AdminPage() {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !hasPermission('canAccessAdminPanel')) {
      router.push('/');
      return;
    }
    loadUsers();
  }, [user, hasPermission, router]);

  const loadUsers = () => {
    // Load users from main database only
    const userDatabase = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
    const activeUsers = (userDatabase.users || []).filter((user: any) => user.isActive !== false);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const adminUsers: AdminUser[] = activeUsers.map((storedUser: any) => ({
      id: storedUser.id,
      username: storedUser.username,
      email: storedUser.email,
      role: storedUser.role || 'User',
      joinDate: storedUser.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      totalPastes: 0
    }));

    // Only include current user if they exist in main database
    if (currentUser.id && activeUsers.some((u: any) => u.id === currentUser.id)) {
      const userInList = adminUsers.find(u => u.id === currentUser.id);
      if (!userInList) {
        const currentUserInDb = activeUsers.find((u: any) => u.id === currentUser.id);
        if (currentUserInDb) {
          adminUsers.push({
            id: currentUserInDb.id,
            username: currentUserInDb.username,
            email: currentUserInDb.email,
            role: currentUserInDb.role || 'User',
            joinDate: currentUserInDb.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            lastActive: new Date().toISOString().split('T')[0],
            totalPastes: 0
          });
        }
      }
    }

    setUsers(adminUsers);
    setLoading(false);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!user || !hasPermission('canPromoteUsers')) return;

    // Check if user can promote to this role
    const currentUserRoleLevel = ROLE_HIERARCHY[user.role];
    const targetRoleLevel = ROLE_HIERARCHY[newRole];

    if (targetRoleLevel >= currentUserRoleLevel) {
      alert('You cannot promote users to a role equal or higher than yours!');
      return;
    }

    // Update in users list
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      )
    );

    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
    const updatedUsers = storedUsers.map((u: any) => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    localStorage.setItem('crazy-paste-users', JSON.stringify(updatedUsers));

    // Update current user if it's them
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === userId) {
      currentUser.role = newRole;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (!user || !hasPermission('canAccessAdminPanel')) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <GlitchText
          text="ADMIN PANEL"
          as="h1"
          color="primary"
          intensity="medium"
          className="text-3xl md:text-4xl font-bold mb-4"
        />
        <p className="text-muted-foreground">
          Manage users, roles, and system settings
        </p>
      </motion.div>

      {/* Role Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiShield className="w-5 h-5" />
              Role Features Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(ROLE_FEATURES).map(([role, data]) => (
                <div key={role} className="p-4 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <RoleBadge role={role as UserRole} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>Max Paste Size: {data.features.maxPasteSize === -1 ? 'Unlimited' : `${data.features.maxPasteSize}KB`}</div>
                    <div>Daily Limit: {data.features.maxPastesPerDay === -1 ? 'Unlimited' : data.features.maxPastesPerDay}</div>
                    <div>Private Pastes: {data.features.canCreatePrivatePastes ? '✓' : '✗'}</div>
                    <div>Admin Access: {data.features.canAccessAdminPanel ? '✓' : '✗'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiUsers className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | 'all')}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.keys(ROLE_FEATURES).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="space-y-4">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="flex items-center justify-between p-4 bg-background/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      {userData.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{userData.username}</div>
                      <div className="text-sm text-muted-foreground">{userData.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {userData.joinDate} • Pastes: {userData.totalPastes}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <RoleBadge role={userData.role} username={userData.username} />
                    {hasPermission('canPromoteUsers') && userData.id !== user.id && (
                      <Select 
                        value={userData.role} 
                        onValueChange={(newRole) => updateUserRole(userData.id, newRole as UserRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(ROLE_FEATURES)
                            .filter(role => ROLE_HIERARCHY[role as UserRole] < ROLE_HIERARCHY[user.role])
                            .map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}