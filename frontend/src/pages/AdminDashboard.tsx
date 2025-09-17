import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";
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

const statsCards = [
  { title: "User Management", value: "7", icon: Users },
  { title: "Online Sensors", value: "23", icon: Wifi },
  { title: "Critical Alerts", value: "2", icon: AlertTriangle }
];

const sensorData = [
  {
    id: "SEN001",
    type: "Seismic",
    location: "Zone A, Building 1", 
    status: "online",
    battery: 85
  },
  {
    id: "SEN002", 
    type: "Flood",
    location: "River Bank Sector 3",
    status: "warning",
    battery: 30
  },
  {
    id: "SEN003",
    type: "Fire", 
    location: "Warehouse 7",
    status: "online",
    battery: 92
  },
  {
    id: "SEN004",
    type: "Air Quality",
    location: "City Center", 
    status: "offline",
    battery: 10
  }
];

const recentAlerts = [
  {
    alert: "Tsunami Warning- High",
    date: "2024-07-26 14:30",
    description: "Tsunami warning issued for coastal regions, Evacuation in progress."
  },
  {
    alert: "Power Outage- Medium", 
    date: "2024-07-26 10:15",
    description: "Widespread power outage affecting District 5. Response teams deployed."
  },
  {
    alert: "Small Earthquake- Low",
    date: "2024-07-25 22:00", 
    description: "Magnitude 3.2 earthquake detected near urban area. No significant damage reported."
  }
];

export default function AdminDashboard() {
  const handleLogout = () => {
    // Handle logout logic
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
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
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
                {sensorData.map((sensor) => (
                  <div key={sensor.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{sensor.id}</Badge>
                        <span className="font-medium text-foreground">{sensor.type}</span>
                      </div>
                      {getStatusBadge(sensor.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{sensor.location}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${getBatteryColor(sensor.battery)}`}>
                        <Battery className="h-4 w-4" />
                        <span>{sensor.battery}%</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{alert.alert}</span>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{alert.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                ))}
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