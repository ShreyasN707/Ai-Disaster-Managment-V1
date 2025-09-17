import { Button } from "@/components/ui/button";
import { Shield, LogOut, User, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  userType?: "public" | "admin" | "operator";
  onLogout?: () => void;
}

export function Navigation({ userType, onLogout }: NavigationProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Use userType prop or derive from auth context
  const currentUserType = userType || user?.role || "public";

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const getNavLinks = () => {
    switch (currentUserType) {
      case "admin":
        return [
          { path: "/admin", label: "Dashboard", icon: Settings },
          { path: "/admin/alerts", label: "Manage Alerts", icon: Shield },
          { path: "/admin/reports", label: "Reports", icon: User },
        ];
      case "operator":
        return [
          { path: "/operator", label: "Dashboard", icon: Settings },
          { path: "/operator/sensors", label: "Sensors", icon: Shield },
          { path: "/operator/incidents", label: "Incidents", icon: User },
        ];
      default:
        return [
          { path: "/", label: "Home", icon: Shield },
          { path: "/info", label: "Info", icon: User },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">DisasterWatch</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUserType !== "public" && (
              <>
                <span className="text-sm text-muted-foreground capitalize">
                  {user?.name || currentUserType} Panel
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
            {currentUserType === "public" && (
              <div className="space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}