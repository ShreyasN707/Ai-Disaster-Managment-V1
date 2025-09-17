import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  Clock, 
  MapPin,
  CheckCircle,
  X,
  Filter,
  Bell,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  location: string;
  sensorId?: string;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

const mockAlerts: Alert[] = [
  {
    id: 'ALT001',
    title: 'River Level Critical',
    description: 'Water level has exceeded critical threshold at monitoring station. Immediate attention required.',
    severity: 'critical',
    status: 'active',
    location: 'Riverfront District, Sector C',
    sensorId: 'SENS001',
    timestamp: '2024-01-15 14:30:00'
  },
  {
    id: 'ALT002',
    title: 'Air Quality Warning',
    description: 'Air quality index showing elevated pollution levels in industrial area.',
    severity: 'high',
    status: 'active',
    location: 'Industrial Zone North',
    sensorId: 'SENS002',
    timestamp: '2024-01-15 13:45:00'
  },
  {
    id: 'ALT003',
    title: 'Sensor Battery Low',
    description: 'Seismic sensor battery level below 20%. Schedule maintenance soon.',
    severity: 'moderate',
    status: 'acknowledged',
    location: 'Mountain Base Research Outpost',
    sensorId: 'SENS003',
    timestamp: '2024-01-15 12:15:00',
    acknowledgedBy: 'Current Operator',
    acknowledgedAt: '2024-01-15 12:20:00'
  },
  {
    id: 'ALT004',
    title: 'Temperature Anomaly',
    description: 'Unusual temperature readings detected. Investigation recommended.',
    severity: 'low',
    status: 'resolved',
    location: 'Residential Area 5',
    sensorId: 'SENS004',
    timestamp: '2024-01-15 10:30:00',
    acknowledgedBy: 'Current Operator',
    acknowledgedAt: '2024-01-15 11:00:00'
  },
  {
    id: 'ALT005',
    title: 'Communication Lost',
    description: 'Lost connection with wind speed sensor. Check communication link.',
    severity: 'high',
    status: 'active',
    location: 'Coastal Observation Post',
    sensorId: 'SENS006',
    timestamp: '2024-01-15 09:20:00'
  }
];

export default function OperatorAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, severityFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, severityFilter);
  };

  const handleSeverityFilter = (severity: string) => {
    setSeverityFilter(severity);
    applyFilters(searchQuery, statusFilter, severity);
  };

  const applyFilters = (search: string, status: string, severity: string) => {
    let filtered = alerts;

    if (search) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.description.toLowerCase().includes(search.toLowerCase()) ||
        alert.location.toLowerCase().includes(search.toLowerCase()) ||
        (alert.sensorId && alert.sensorId.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(alert => alert.status === status);
    }

    if (severity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severity);
    }

    setFilteredAlerts(filtered);
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: 'Current Operator',
            acknowledgedAt: new Date().toLocaleString()
          }
        : alert
    ));
    
    // Update filtered alerts too
    setFilteredAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: 'Current Operator',
            acknowledgedAt: new Date().toLocaleString()
          }
        : alert
    ));

    toast({
      title: "Alert Acknowledged",
      description: `Alert ${alertId} has been acknowledged successfully.`,
    });
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            acknowledgedBy: 'Current Operator',
            acknowledgedAt: new Date().toLocaleString()
          }
        : alert
    ));
    
    setFilteredAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            acknowledgedBy: 'Current Operator',
            acknowledgedAt: new Date().toLocaleString()
          }
        : alert
    ));

    toast({
      title: "Alert Resolved",
      description: `Alert ${alertId} has been marked as resolved.`,
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="critical">Critical</Badge>;
      case 'high':
        return <Badge variant="high">High</Badge>;
      case 'moderate':
        return <Badge variant="moderate">Moderate</Badge>;
      default:
        return <Badge variant="low">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="safe">Resolved</Badge>;
      case 'acknowledged':
        return <Badge variant="warning">Acknowledged</Badge>;
      default:
        return <Badge variant="critical">Active</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return "border-critical/20 bg-critical/5";
      case 'high':
        return "border-high/20 bg-high/5";
      case 'moderate':
        return "border-moderate/20 bg-moderate/5";
      default:
        return "border-low/20 bg-low/5";
    }
  };

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OperatorSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Alert Management</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">System Alerts</h2>
              <p className="text-muted-foreground">Monitor and respond to system-generated alerts</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-critical/20 bg-critical/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-critical" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-critical">{activeCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-warning/20 bg-warning/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
                  <CheckCircle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{acknowledgedCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-safe/20 bg-safe/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-safe" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-safe">{resolvedCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-critical/20 bg-critical/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Active</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-critical" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-critical">{criticalCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Alerts */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <CardTitle>Alert List</CardTitle>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <SearchBar
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full sm:w-80"
                    />
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="acknowledged">Acknowledged</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={severityFilter} onValueChange={handleSeverityFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground font-mono">{alert.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {alert.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{alert.timestamp}</span>
                        </div>
                        {alert.sensorId && (
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Sensor: {alert.sensorId}</span>
                          </div>
                        )}
                        {alert.acknowledgedBy && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Acked by {alert.acknowledgedBy} at {alert.acknowledgedAt}</span>
                          </div>
                        )}
                      </div>
                      
                      {alert.status === 'active' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Resolve
                          </Button>
                        </div>
                      )}
                      
                      {alert.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}