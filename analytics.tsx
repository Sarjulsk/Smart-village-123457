import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import LocationChart from "@/components/location-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: locationStats, isLoading: locationLoading } = useQuery({
    queryKey: ["/api/analytics/location"],
    retry: false,
  });

  const { data: occupationStats, isLoading: occupationLoading } = useQuery({
    queryKey: ["/api/analytics/occupation"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const totalOccupations = occupationStats?.reduce((sum: number, stat: any) => sum + stat.count, 0) || 1;

  return (
    <DashboardLayout 
      currentPage="analytics"
      onPageChange={() => {}}
      title="Analytics"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Location Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {locationLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading chart...</p>
                </div>
              ) : locationStats && locationStats.length > 0 ? (
                <LocationChart data={locationStats} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-600">No location data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Occupation Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Occupation Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {occupationLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading occupation data...</p>
                </div>
              ) : occupationStats && occupationStats.length > 0 ? (
                <div className="space-y-4">
                  {occupationStats.map((stat: any) => {
                    const percentage = Math.round((stat.count / totalOccupations) * 100);
                    return (
                      <div key={stat.occupation} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 capitalize">
                            {stat.occupation === 'job' ? 'Employment' : stat.occupation}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {stat.count}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-600">No occupation data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Movement Trends Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Movement Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <div className="text-4xl text-slate-400 mb-4">📈</div>
                <p className="text-sm text-slate-600">Movement trends chart</p>
                <p className="text-xs text-slate-500 mt-2">
                  Shows people leaving/returning to village over time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
