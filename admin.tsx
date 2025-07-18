import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserCheck, 
  Clock, 
  Download, 
  UserPlus, 
  FileText, 
  Bell, 
  Settings,
  Edit2,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      // Redirect to dashboard or home
      window.location.href = '/';
      return;
    }
  }, [user, isAuthenticated, isLoading, toast]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
    retry: false,
    enabled: user?.role === 'admin',
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest('PUT', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/export/residents', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'village_residents.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return <div>Loading...</div>;
  }

  const activeUsers = users?.filter((u: any) => u.resident)?.length || 0;
  const pendingUsers = users?.filter((u: any) => !u.resident)?.length || 0;

  return (
    <DashboardLayout 
      currentPage="admin"
      onPageChange={() => {}}
      title="Admin Panel"
    >
      <div className="space-y-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Pending Profiles"
            value={pendingUsers}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Total People"
            value={stats?.total || 0}
            icon={Download}
            color="blue"
          />
        </div>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center p-6 h-auto"
                onClick={handleExportData}
              >
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Export Data</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-6 h-auto"
                disabled
              >
                <Bell className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium">Send Notifications</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-6 h-auto"
                disabled
              >
                <Settings className="h-8 w-8 text-slate-600 mb-2" />
                <span className="text-sm font-medium">System Settings</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-6 h-auto"
                disabled
              >
                <UserPlus className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Bulk Import</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Button onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div>Loading users...</div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userData: any) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                src={userData.profileImageUrl || ""} 
                                alt={`${userData.firstName} ${userData.lastName}`}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                {userData.firstName?.[0]}{userData.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-slate-500">{userData.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userData.resident ? "default" : "secondary"}>
                            {userData.resident ? "Active" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={userData.role}
                            onValueChange={(value) => handleRoleChange(userData.id, value)}
                            disabled={userData.id === user?.id}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {userData.resident ? (
                            <span className="text-sm text-slate-900">
                              {userData.resident.fullName}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">No profile</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {userData.id !== user?.id && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteUser(userData.id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
