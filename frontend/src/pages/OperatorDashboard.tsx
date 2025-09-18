import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/shared/StatsCard";
import MLDisasterMap from "@/components/map/MLDisasterMap";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Activity,
  Battery,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Timer
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

export default function OperatorDashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
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

        const response = await fetch('http://localhost:4000/api/operator/dashboard', {
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
        console.log('Operator dashboard data:', data); // Debug log
        setSensors(data.sensors || []);
        setAlerts(data.alerts || []);

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
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="high">High</Badge>;
      case "critical":
        return <Badge variant="critical">Critical</Badge>;
      case "moderate":
        return <Badge variant="moderate">Medium</Badge>;
      default:
        return <Badge variant="low">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge variant="online">Online</Badge>;
      case "offline":
        return <Badge variant="offline">Offline</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "ongoing":
        return <Badge variant="warning">Ongoing</Badge>;
      case "resolved":
        return <Badge variant="safe">Resolved</Badge>;
      case "pending":
        return <Badge variant="pending">Pending</Badge>;
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
        <OperatorSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Operator Dashboard</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, Operator!</h2>
              <p className="text-muted-foreground">
                Your dashboard for real-time disaster monitoring and response management.
              </p>
            </div>

        {/* Active Alerts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Loading alerts...
                </div>
              ) : alerts.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No active alerts at this time.
                </div>
              ) : (
                alerts.filter(alert => alert.active).slice(0, 6).map((alert) => (
                  <div key={alert._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{alert.area}</h3>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 
                                alert.severity === 'high' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.area}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Sensor Status Monitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Sensor Status Monitor</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time health overview of critical sensors.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading sensors...
                  </div>
                ) : sensors.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No sensors assigned to you.
                  </div>
                ) : (
                  sensors.slice(0, 6).map((sensor) => (
                    <div key={sensor._id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{sensor.sensorId}</h4>
                        {getStatusBadge(sensor.status)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">{sensor.type}</p>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{formatLocation(sensor.location)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getBatteryColor(sensor.battery)}`}>
                          <Battery className="h-3 w-3" />
                          <span>Battery: {sensor.battery}%</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Last Reading: {sensor.lastReading || 'No recent data'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Response Activity Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Incident ID</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Assigned Team</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Loading incidents...
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No incident data available. This feature requires additional backend implementation.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered Real-Time Map */}
          <div className="lg:col-span-2">
            <MLDisasterMap 
              height="400px"
              alerts={alerts.filter(alert => alert.active).map(alert => ({
                ...alert,
                title: alert.message,
                severity: alert.severity as 'low' | 'moderate' | 'high' | 'critical'
              }))}
              sensors={sensors.map(sensor => ({
                ...sensor,
                health: sensor.health as 'good' | 'warning' | 'critical',
                location: typeof sensor.location === 'string' ? sensor.location : sensor.location?.address || 'Unknown'
              }))}
            />
          </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}