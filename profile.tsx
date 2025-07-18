import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import PersonForm from "@/components/person-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit2, MapPin, Phone, Calendar, Briefcase } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ResidentWithUser } from "@shared/schema";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);

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

  const { data: resident, isLoading: residentLoading } = useQuery({
    queryKey: ["/api/residents/me"],
    retry: false,
  });

  const getLocationDisplay = (resident: ResidentWithUser) => {
    switch (resident.currentLocation) {
      case 'village':
        return 'In Village';
      case 'city':
        return resident.currentCity ? `${resident.currentCity}` : 'In City';
      case 'abroad':
        return resident.currentCountry ? `${resident.currentCountry}` : 'Abroad';
      default:
        return resident.currentLocation;
    }
  };

  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'village':
        return <Badge variant="default">In Village</Badge>;
      case 'city':
        return <Badge variant="secondary">In City</Badge>;
      case 'abroad':
        return <Badge variant="destructive">Abroad</Badge>;
      default:
        return <Badge variant="outline">{location}</Badge>;
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout 
      currentPage="profile"
      onPageChange={() => {}}
      title="My Profile"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {residentLoading ? (
          <div>Loading profile...</div>
        ) : !resident ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Create Your Profile
              </h3>
              <p className="text-slate-600 mb-6">
                Complete your profile to be visible in the village directory.
              </p>
              <Button onClick={() => setFormOpen(true)}>
                Create Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={user?.profileImageUrl || ""} 
                      alt={resident.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg">
                      {resident.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {resident.fullName}
                        </h2>
                        <p className="text-slate-600">
                          {resident.age} years old • {resident.gender}
                        </p>
                        <div className="mt-2">
                          {getLocationBadge(resident.currentLocation)}
                        </div>
                      </div>
                      <Button onClick={() => setFormOpen(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone Number</label>
                    <p className="text-slate-900">{resident.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">House Number / Tola</label>
                    <p className="text-slate-900">{resident.houseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-900">{user?.email || 'Not provided'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Current Location</label>
                    <p className="text-slate-900">{getLocationDisplay(resident)}</p>
                  </div>
                  {resident.departureDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Departure Date</label>
                      <p className="text-slate-900">
                        {new Date(resident.departureDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {resident.expectedReturnDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Expected Return</label>
                      <p className="text-slate-900">
                        {new Date(resident.expectedReturnDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Occupation</label>
                    <p className="text-slate-900 capitalize">{resident.occupation}</p>
                  </div>
                  {resident.company && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Company/Institution</label>
                      <p className="text-slate-900">{resident.company}</p>
                    </div>
                  )}
                  {resident.workSector && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Work Sector</label>
                      <p className="text-slate-900">{resident.workSector}</p>
                    </div>
                  )}
                  {resident.workDetails && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Work Details</label>
                      <p className="text-slate-900">{resident.workDetails}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Profile Visible</span>
                    <Badge variant={resident.isVisible ? "default" : "secondary"}>
                      {resident.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Show Phone Number</span>
                    <Badge variant={resident.showPhone ? "default" : "secondary"}>
                      {resident.showPhone ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Show Location</span>
                    <Badge variant={resident.showLocation ? "default" : "secondary"}>
                      {resident.showLocation ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Show Return Date</span>
                    <Badge variant={resident.showReturnDate ? "default" : "secondary"}>
                      {resident.showReturnDate ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <PersonForm
          open={formOpen}
          onOpenChange={setFormOpen}
          resident={resident || undefined}
          mode={resident ? 'edit' : 'create'}
        />
      </div>
    </DashboardLayout>
  );
}
