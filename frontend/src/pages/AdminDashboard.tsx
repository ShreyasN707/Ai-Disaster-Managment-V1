import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Activity,
  FileText,
  AlertTriangle,
  TrendingUp,
  Shield,
  CheckCircle,
  Clock,
  MapPin,
  Battery,
  Wifi
} from "lucide-react";

interface Sensor {
  _id: string;
  sensorId: string;
  type: string;
  location: string | { lat?: number; lng?: number; address?: string };
  status: "online" | "offline" | "warning";
  battery: number;
  health: string;
  lastReading?: string;
}

interface Alert {
  _id: string;
  message: string;
  area: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  active: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineSensors: 0,
    criticalAlerts: 0
  });
  const { toast } = useToast();

  const formatLocation = (loc: Sensor['location']) => {
    if (typeof loc === 'string') return loc;
    if (!loc) return 'Unknown';
    if (loc.address) return loc.address;
    if (loc.lat != null && loc.lng != null) return `${loc.lat}, ${loc.lng}`;
    return 'Unknown';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch('http://localhost:4000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch dashboard data`);
        }

        const data = await response.json();
        console.log('Admin dashboard data:', data); // Debug log
        setSensors(data.sensors || []);
        setAlerts(data.alerts || []);
        
        // Calculate stats from real data
        const onlineSensors = data.sensors?.filter((s: Sensor) => s.status === 'online').length || 0;
        const criticalAlerts = data.alerts?.filter((a: Alert) => a.severity === 'critical' && a.active).length || 0;
        
        setStats({
          totalUsers: 0, // This would need a separate API call
          onlineSensors,
          criticalAlerts
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        
        // Only show toast for non-network errors or if it's the first load
        if (!error.message.includes('Failed to fetch') || sensors.length === 0) {
          toast({
            title: "Dashboard Load Issue",
            description: "Some data may be unavailable. Retrying automatically...",
            variant: "default",
          });
        }
        
        // Set fallback data to prevent UI errors
        setSensors([]);
        setAlerts([]);
        setStats({
          totalUsers: 0,
          onlineSensors: 0,
          criticalAlerts: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge variant="online">Online</Badge>;
      case "offline":
        return <Badge variant="offline">Offline</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-safe";
    if (battery > 20) return "text-warning";
    return "text-critical";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Admin Dashboard</h1>
          </header>

          <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Displaying real-time sensor and alert data.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : stats.totalUsers}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Online Sensors
              </CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : stats.onlineSensors}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {loading ? "..." : stats.criticalAlerts}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sensor Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Sensor Status Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading sensors...
                  </div>
                ) : sensors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sensors found.
                  </div>
                ) : (
                  sensors.slice(0, 6).map((sensor) => (
                    <div key={sensor._id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{sensor.sensorId}</Badge>
                          <span className="font-medium text-foreground">{sensor.type}</span>
                        </div>
                        {getStatusBadge(sensor.status)}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{formatLocation(sensor.location)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getBatteryColor(sensor.battery)}`}>
                          <Battery className="h-4 w-4" />
                          <span>{sensor.battery}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alert Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recent Alert Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading alerts...
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent alerts.
                  </div>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div key={alert._id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={alert.severity === 'critical' ? 'destructive' : 
                                    alert.severity === 'high' ? 'default' : 'outline'}
                            className="capitalize"
                          >
                            {alert.severity}
                          </Badge>
                          <span className="font-medium text-foreground">{alert.area}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border">
                <Button variant="outline" className="w-full">
                  View All Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}