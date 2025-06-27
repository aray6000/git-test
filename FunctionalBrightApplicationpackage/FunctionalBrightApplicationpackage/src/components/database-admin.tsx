
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { UserDatabaseManager, UserQuery } from '@/lib/database';
import { getDatabaseStats, User } from '@/lib/auth';
import { motion } from 'framer-motion';
import { FiDownload, FiUpload, FiTrash2, FiRefreshCw, FiSearch, FiDatabase, FiUsers, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

export function DatabaseAdmin() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(getDatabaseStats());
    const { users: allUsers } = UserQuery.getUsersPaginated(1, 50);
    setUsers(allUsers);
  };

  const handleExport = () => {
    const data = UserDatabaseManager.exportDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importData.trim()) return;
    
    setLoading(true);
    const result = UserDatabaseManager.importDatabase(importData);
    
    if (result.success) {
      loadData();
      setImportData('');
    }
    
    alert(result.message);
    setLoading(false);
  };

  const handleValidate = () => {
    setLoading(true);
    const result = UserDatabaseManager.validateDatabase();
    setValidationResult(result);
    setLoading(false);
  };

  const handleRepair = async () => {
    setLoading(true);
    
    // Import the comprehensive repair service
    const { DatabaseRepairService } = await import('@/lib/database-repair');
    const result = await DatabaseRepairService.repairAllDatabases();
    
    if (result.success) {
      loadData();
      handleValidate(); // Re-validate after repair
    }
    
    alert(result.message + (result.repairs.length > 0 ? '\n\nRepairs made:\n' + result.repairs.join('\n') : ''));
    setLoading(false);
  };

  const handleClear = () => {
    if (!confirm('Are you sure you want to clear all user data? This action cannot be undone!')) {
      return;
    }
    
    setLoading(true);
    const result = UserDatabaseManager.clearDatabase();
    
    if (result.success) {
      loadData();
      setValidationResult(null);
    }
    
    alert(result.message);
    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sizeInfo = UserDatabaseManager.getDatabaseSize();

  return (
    <div className="space-y-6">
      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiDatabase className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.verifiedUsers}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{stats.recentUsers}</div>
                <div className="text-sm text-muted-foreground">Recent (7d)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{Math.round(sizeInfo.totalSize / 1024)}KB</div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <FiDownload className="h-4 w-4" />
              Export Database
            </Button>
            <Button onClick={handleValidate} variant="outline" className="flex items-center gap-2" disabled={loading}>
              <FiCheckCircle className="h-4 w-4" />
              Validate Database
            </Button>
            <Button onClick={handleRepair} variant="outline" className="flex items-center gap-2" disabled={loading}>
              <FiRefreshCw className="h-4 w-4" />
              Repair Database
            </Button>
            <Button onClick={handleClear} variant="destructive" className="flex items-center gap-2" disabled={loading}>
              <FiTrash2 className="h-4 w-4" />
              Clear Database
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Import Database</label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste exported database JSON here..."
              rows={4}
            />
            <Button onClick={handleImport} disabled={!importData.trim() || loading} className="flex items-center gap-2">
              <FiUpload className="h-4 w-4" />
              Import Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <FiCheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <FiXCircle className="h-5 w-5 text-red-500" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                {validationResult.isValid ? "Database is valid" : "Database has issues"}
              </Badge>
              
              {validationResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-500 flex items-center gap-2">
                    <FiXCircle className="h-4 w-4" />
                    Errors:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-400">
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-500 flex items-center gap-2">
                    <FiAlertTriangle className="h-4 w-4" />
                    Warnings:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-yellow-400">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiUsers className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <FiSearch className="h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                    {user.lastLogin && ` | Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={user.emailVerified ? "default" : "outline"}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
