import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import PersonForm from "@/components/person-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ResidentWithUser } from "@shared/schema";

export default function PeoplePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentWithUser | null>(null);

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

  const { data: residents, isLoading: residentsLoading } = useQuery({
    queryKey: ["/api/residents"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/residents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resident deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
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
        description: error.message || "Failed to delete resident",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (resident: ResidentWithUser) => {
    setEditingResident(resident);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this resident?')) {
      deleteMutation.mutate(id);
    }
  };

  const getLocationBadge = (location: string, city?: string, country?: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let text = location;
    
    switch (location) {
      case 'village':
        variant = "default";
        text = "In Village";
        break;
      case 'city':
        variant = "secondary";
        text = city ? `${city}` : "In City";
        break;
      case 'abroad':
        variant = "destructive";
        text = country ? `${country}` : "Abroad";
        break;
    }
    
    return <Badge variant={variant}>{text}</Badge>;
  };

  const canEdit = (resident: ResidentWithUser) => {
    return user?.role === 'admin' || resident.userId === user?.id;
  };

  const canDelete = (resident: ResidentWithUser) => {
    return user?.role === 'admin' || resident.userId === user?.id;
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout 
      currentPage="people"
      onPageChange={() => {}}
      title="People Directory"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>People Directory</CardTitle>
              <Button onClick={() => {
                setEditingResident(null);
                setFormOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {residentsLoading ? (
              <div>Loading residents...</div>
            ) : !residents || residents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No residents found. Add the first person to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {residents.map((resident: ResidentWithUser) => (
                      <TableRow key={resident.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {resident.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">{resident.fullName}</div>
                              <div className="text-sm text-slate-500">{resident.houseNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{resident.age}</TableCell>
                        <TableCell>
                          {getLocationBadge(resident.currentLocation, resident.currentCity || undefined, resident.currentCountry || undefined)}
                        </TableCell>
                        <TableCell className="capitalize">{resident.occupation}</TableCell>
                        <TableCell>
                          {resident.showPhone || user?.role === 'admin' || resident.userId === user?.id 
                            ? resident.phoneNumber 
                            : '***-***-****'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit(resident) && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(resident)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete(resident) && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(resident.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
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

        <PersonForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingResident(null);
          }}
          resident={editingResident || undefined}
          mode={editingResident ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
}
