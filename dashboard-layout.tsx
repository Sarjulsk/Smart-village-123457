import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Home, 
  BarChart3, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  title: string;
}

export default function DashboardLayout({ 
  children, 
  currentPage, 
  onPageChange, 
  title 
}: DashboardLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: 'Dashboard', icon: Home, id: 'dashboard' },
    { name: 'People', icon: Users, id: 'people' },
    { name: 'Analytics', icon: BarChart3, id: 'analytics' },
    { name: 'My Profile', icon: User, id: 'profile' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', icon: Settings, id: 'admin' }] : []),
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 bg-primary">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center mr-3">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="text-white font-semibold">Village Connect</span>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  currentPage === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-slate-600 hover:bg-slate-100"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-lg"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col flex-1 min-h-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.profileImageUrl || ""} 
                    alt={user?.firstName || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
