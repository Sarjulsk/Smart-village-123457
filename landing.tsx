import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Home, MapPin, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-8">
              <Users className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Smart Village Connect
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              A comprehensive people management system to track residents' locations, 
              activities, and stay connected with your village community wherever they are.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Connect Your Village Community
          </h2>
          <p className="text-xl text-slate-600">
            Whether your people are in the village, cities, or abroad - stay connected
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Track Locations
              </h3>
              <p className="text-slate-600">
                Know who's in the village, cities, or abroad. Keep track of everyone's whereabouts and travel plans.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Manage Profiles
              </h3>
              <p className="text-slate-600">
                Comprehensive profiles with occupation, work details, and contact information for every resident.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                View Analytics
              </h3>
              <p className="text-slate-600">
                Get insights into population distribution, occupation trends, and movement patterns.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Connect Your Village?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join the platform and help build a stronger, more connected community.
            </p>
            <Button 
              variant="secondary"
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2024 Smart Village Connect. Connecting communities, wherever they are.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
