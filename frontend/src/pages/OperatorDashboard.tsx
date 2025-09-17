import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/shared/StatsCard";
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

const activeAlerts = [
  {
    title: "Major Flood Warning",
    severity: "high",
    description: "Heavy rainfall causing rapid river level rise. Evacuation advisory issued.",
    location: "Riverfront District, Sector C",
    time: "10:30 AM, Today"
  },
  {
    title: "Wildfire Near Forest Edge", 
    severity: "high",
    description: "Fire detected in East Forest, moving towards residential area. Response team deployed.",
    location: "East Forest Boundary, Zone B",
    time: "09:15 AM, Today"
  },
  {
    title: "Infrastructure Damage Report",
    severity: "moderate",
    description: "Bridge structural integrity compromised after recent weather events.",
    location: "Bridge 42, Central Artery", 
    time: "08:00 AM, Today"
  }
];

const sensorStatus = [
  {
    name: "River Level Sensor 1",
    type: "Hydrological Sensor",
    location: "Riverfront Pier",
    status: "warning",
    battery: 65,
    lastReading: "10:50 AM, Today"
  },
  {
    name: "Air Quality Monitor 3",
    type: "Environmental Sensor", 
    location: "Industrial Zone North",
    status: "online",
    battery: 92,
    lastReading: "10:55 AM, Today"
  },
  {
    name: "Seismic Sensor A",
    type: "Geological Sensor",
    location: "Mountain Base Research Outpost", 
    status: "online",
    battery: 78,
    lastReading: "10:45 AM, Today"
  },
  {
    name: "Temperature & Humidity 2",
    type: "Environmental Sensor",
    location: "Residential Area 5",
    status: "offline", 
    battery: 15,
    lastReading: "08:30 AM, Today"
  },
  {
    name: "Water Quality Probe",
    type: "Hydrological Sensor",
    location: "Lakeview Pumping Station",
    status: "online",
    battery: 85,
    lastReading: "10:52 AM, Today"
  },
  {
    name: "Wind Speed Sensor", 
    type: "Meteorological Sensor",
    location: "Coastal Observation Post",
    status: "warning",
    battery: 30,
    lastReading: "10:48 AM, Today"
  }
];

const responseActivity = [
  {
    id: "INC005",
    location: "Central Park",
    status: "ongoing", 
    team: "Alpha Squad",
    lastUpdate: "10:40 AM"
  },
  {
    id: "INC004",
    location: "Downtown Plaza",
    status: "resolved",
    team: "Bravo Team", 
    lastUpdate: "09:55 AM"
  },
  {
    id: "INC003", 
    location: "Highway 101",
    status: "pending",
    team: "Charlie Unit",
    lastUpdate: "Yesterday, 06:00 PM"
  },
  {
    id: "INC002",
    location: "Port Area", 
    status: "resolved",
    team: "Delta Force",
    lastUpdate: "Yesterday, 03:20 PM"
  },
  {
    id: "INC001",
    location: "Suburban Residential",
    status: "ongoing",
    team: "Echo Team",
    lastUpdate: "Yesterday, 01:10 PM"
  }
];

export default function OperatorDashboard() {

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
              {activeAlerts.map((alert, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {alert.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{alert.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                {sensorStatus.map((sensor, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{sensor.name}</h4>
                      {getStatusBadge(sensor.status)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">{sensor.type}</p>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{sensor.location}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${getBatteryColor(sensor.battery)}`}>
                        <Battery className="h-3 w-3" />
                        <span>Battery: {sensor.battery}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last Reading: {sensor.lastReading}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                    {responseActivity.map((incident, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {incident.id}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-foreground">{incident.location}</td>
                        <td className="py-3 px-2">{getStatusBadge(incident.status)}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{incident.team}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{incident.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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