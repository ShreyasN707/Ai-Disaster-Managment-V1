import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Layers, 
  Filter, 
  RefreshCw, 
  Maximize, 
  AlertTriangle,
  Activity,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MLDisasterMap from '@/components/map/MLDisasterMap';
import RealTimeMap from '@/components/map/RealTimeMap';
import RealTimeGPSMap from '@/components/map/RealTimeGPSMap';
import io from 'socket.io-client';

interface Alert {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  area: string;
  active: boolean;
  createdAt: string;
}

interface Sensor {
  _id: string;
  sensorId: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  health: 'good' | 'warning' | 'critical';
  battery: number;
  location: string;
}

export default function MapView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [mapType, setMapType] = useState<'realtime' | 'gps' | 'ml'>('gps');
  const { user, token } = useAuth();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch alerts
      const alertsResponse = await fetch('http://localhost:4000/api/public/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      // Fetch sensors (if authenticated)
      if (token) {
        const sensorsResponse = await fetch('http://localhost:4000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (sensorsResponse.ok) {
          const sensorsData = await sensorsResponse.json();
          setSensors(sensorsData.sensors || []);
        }
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Setup real-time updates
  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('newAlert', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    socket.on('alertUpdated', (updatedAlert: Alert) => {
      setAlerts(prev => prev.map(alert => 
        alert._id === updatedAlert._id ? updatedAlert : alert
      ));
    });

    socket.on('sensorUpdate', (updatedSensor: Sensor) => {
      setSensors(prev => prev.map(sensor => 
        sensor._id === updatedSensor._id ? updatedSensor : sensor
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter data
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus === 'active' && !alert.active) return false;
    if (filterStatus === 'inactive' && alert.active) return false;
    return true;
  });

  const filteredSensors = sensors.filter(sensor => {
    if (filterStatus !== 'all' && sensor.status !== filterStatus) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'moderate':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Moderate</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const Sidebar = user?.role === 'ADMIN' ? AdminSidebar : OperatorSidebar;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Disaster Management Map</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Real-Time Map View</h2>
                <p className="text-muted-foreground">Monitor alerts and sensors in real-time</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={mapType === 'gps' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMapType('gps')}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  GPS Map
                </Button>
                <Button
                  variant={mapType === 'realtime' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMapType('realtime')}
                >
                  <Activity className="h-4 w-4 mr-1" />
                  Real-Time
                </Button>
                <Button
                  variant={mapType === 'ml' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMapType('ml')}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  AI/ML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlerts(!showAlerts)}
                >
                  {showAlerts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Alerts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSensors(!showSensors)}
                >
                  {showSensors ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Sensors
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alert Severity</label>
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map and Data Grid */}
            <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-6`}>
              {/* Main Map */}
              <div className={isFullscreen ? 'col-span-1' : 'lg:col-span-2'}>
                {mapType === 'gps' ? (
                  <RealTimeGPSMap 
                    className="w-full" 
                    height={isFullscreen ? '70vh' : '500px'}
                  />
                ) : mapType === 'realtime' ? (
                  <RealTimeMap className="w-full" />
                ) : (
                  <MLDisasterMap
                    height={isFullscreen ? '70vh' : '500px'}
                    alerts={showAlerts ? filteredAlerts : []}
                    sensors={showSensors ? filteredSensors : []}
                  />
                )}
              </div>

              {/* Side Panel */}
              {!isFullscreen && (
                <div className="space-y-6">
                  {/* Active Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Active Alerts ({filteredAlerts.filter(a => a.active).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredAlerts.filter(a => a.active).slice(0, 10).map((alert) => (
                          <div key={alert._id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              {getSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.area}</span>
                            </div>
                          </div>
                        ))}
                        {filteredAlerts.filter(a => a.active).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No active alerts</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sensor Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Sensors ({filteredSensors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredSensors.slice(0, 10).map((sensor) => (
                          <div key={sensor._id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{sensor.sensorId}</h4>
                              {getStatusBadge(sensor.status)}
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{sensor.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3" />
                                <span>Battery: {sensor.battery}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {filteredSensors.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No sensors found</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-lg font-bold text-red-600">
                            {alerts.filter(a => a.severity === 'critical' && a.active).length}
                          </div>
                          <div className="text-xs text-red-700">Critical</div>
                        </div>
                        <div className="p-2 bg-orange-50 rounded">
                          <div className="text-lg font-bold text-orange-600">
                            {alerts.filter(a => a.severity === 'high' && a.active).length}
                          </div>
                          <div className="text-xs text-orange-700">High</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">
                            {sensors.filter(s => s.status === 'online').length}
                          </div>
                          <div className="text-xs text-green-700">Online</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-600">
                            {sensors.filter(s => s.status === 'offline').length}
                          </div>
                          <div className="text-xs text-gray-700">Offline</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
