import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Home, MapPin, Globe, Plane, UserPlus, Edit } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function HomePage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    retry: false,
  });

  const { data: residents, isLoading: residentsLoading } = useQuery({
    queryKey: ["/api/residents"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const recentActivities = [
    {
      id: 1,
      type: 'return',
      user: 'Rahul Kumar',
      action: 'returned to village',
      time: '2 hours ago',
      icon: Plane,
      color: 'green'
    },
    {
      id: 2,
      type: 'join',
      user: 'Priya Singh',
      action: 'joined the platform',
      time: '5 hours ago',
      icon: UserPlus,
      color: 'blue'
    },
    {
      id: 3,
      type: 'update',
      user: 'Amit Yadav',
      action: 'updated their location',
      time: '1 day ago',
      icon: Edit,
      color: 'yellow'
    },
  ];

  const filters = [
    { name: 'All People', active: true },
    { name: 'Outside Village', active: false },
    { name: 'In Village', active: false },
    { name: 'Abroad', active: false },
    { name: 'Returning This Month', active: false },
    { name: 'Away 1+ Year', active: false },
  ];

  if (statsLoading) {
    return (
      <DashboardLayout 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        title="Dashboard"
      >
        <div>Loading statistics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      title="Dashboard"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total People"
            value={stats?.total || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="In Village"
            value={stats?.inVillage || 0}
            icon={Home}
            color="green"
          />
          <StatCard
            title="In Cities"
            value={stats?.inCity || 0}
            icon={MapPin}
            color="yellow"
          />
          <StatCard
            title="Abroad"
            value={stats?.abroad || 0}
            icon={Globe}
            color="purple"
          />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {filters.map((filter, index) => (
                <Button
                  key={index}
                  variant={filter.active ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  {filter.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
