import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Zap, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import io from 'socket.io-client';

interface RealTimeMapProps {
  className?: string;
}

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

export default function RealTimeMap({ className }: RealTimeMapProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { token } = useAuth();

  // Fetch initial data
  useEffect(() => {
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

    fetchData();
  }, [token]);

  // Setup real-time updates
  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('newAlert', (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
      setLastUpdate(new Date());
    });

    socket.on('alertUpdated', (updatedAlert: Alert) => {
      setAlerts(prev => prev.map(alert => 
        alert._id === updatedAlert._id ? updatedAlert : alert
      ));
      setLastUpdate(new Date());
    });

    socket.on('sensorUpdate', (updatedSensor: Sensor) => {
      setSensors(prev => prev.map(sensor => 
        sensor._id === updatedSensor._id ? updatedSensor : sensor
      ));
      setLastUpdate(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const activeAlerts = alerts.filter(alert => alert.active);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const onlineSensors = sensors.filter(sensor => sensor.status === 'online');
  const criticalSensors = sensors.filter(sensor => sensor.health === 'critical');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'good': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Real-Time Disaster Map
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
                <div className="text-sm text-red-700">Critical Alerts</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{activeAlerts.length}</div>
                <div className="text-sm text-orange-700">Active Alerts</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{onlineSensors.length}</div>
                <div className="text-sm text-green-700">Online Sensors</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{criticalSensors.length}</div>
                <div className="text-sm text-gray-700">Critical Sensors</div>
              </div>
            </div>

            {/* Interactive Map Area */}
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Background city layout */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 256" preserveAspectRatio="xMidYMid meet">
                  {/* Grid pattern */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* City districts */}
                  <rect x="50" y="40" width="80" height="60" fill="#ddd6fe" stroke="#9ca3af" strokeWidth="1" rx="4"/>
                  <text x="90" y="75" textAnchor="middle" fontSize="8" fill="#374151">Downtown</text>
                  
                  <rect x="150" y="35" width="70" height="50" fill="#bfdbfe" stroke="#9ca3af" strokeWidth="1" rx="4"/>
                  <text x="185" y="65" textAnchor="middle" fontSize="8" fill="#374151">Riverside</text>
                  
                  <rect x="40" y="120" width="90" height="55" fill="#fed7d7" stroke="#9ca3af" strokeWidth="1" rx="4"/>
                  <text x="85" y="150" textAnchor="middle" fontSize="8" fill="#374151">Industrial</text>
                  
                  <rect x="150" y="110" width="80" height="70" fill="#d1fae5" stroke="#9ca3af" strokeWidth="1" rx="4"/>
                  <text x="190" y="150" textAnchor="middle" fontSize="8" fill="#374151">Residential</text>
                  
                  <rect x="250" y="140" width="70" height="50" fill="#fef3c7" stroke="#9ca3af" strokeWidth="1" rx="4"/>
                  <text x="285" y="170" textAnchor="middle" fontSize="8" fill="#374151">Business</text>
                  
                  {/* Roads */}
                  <line x1="50" y1="100" x2="320" y2="100" stroke="#6b7280" strokeWidth="2"/>
                  <line x1="50" y1="190" x2="320" y2="190" stroke="#6b7280" strokeWidth="2"/>
                  <line x1="130" y1="40" x2="130" y2="200" stroke="#6b7280" strokeWidth="2"/>
                  <line x1="240" y1="40" x2="240" y2="200" stroke="#6b7280" strokeWidth="2"/>
                </svg>

                {/* Overlay indicators for active alerts */}
                {activeAlerts.slice(0, 5).map((alert, index) => {
                  const positions = [
                    { top: '25%', left: '20%' },
                    { top: '45%', left: '40%' },
                    { top: '35%', left: '65%' },
                    { top: '65%', left: '25%' },
                    { top: '55%', left: '75%' }
                  ];
                  const position = positions[index] || positions[0];
                  
                  return (
                    <div
                      key={alert._id}
                      className={`absolute w-4 h-4 rounded-full ${getSeverityColor(alert.severity)} border-2 border-white shadow-lg animate-pulse z-10 cursor-pointer`}
                      style={position}
                      title={`${alert.area}: ${alert.title || alert.message}`}
                      onClick={() => {
                        window.alert(`Alert: ${alert.title || alert.message}\nArea: ${alert.area}\nSeverity: ${alert.severity}`);
                      }}
                    />
                  );
                })}

                {/* Overlay indicators for sensors */}
                {sensors.slice(0, 8).map((sensor, index) => {
                  const positions = [
                    { top: '30%', right: '15%' },
                    { top: '50%', right: '35%' },
                    { top: '40%', right: '60%' },
                    { top: '70%', right: '20%' },
                    { top: '60%', right: '45%' },
                    { top: '35%', right: '80%' },
                    { top: '75%', right: '65%' },
                    { top: '45%', right: '10%' }
                  ];
                  const position = positions[index] || positions[0];
                  
                  return (
                    <div
                      key={sensor._id}
                      className={`absolute w-3 h-3 rounded-full ${getHealthColor(sensor.health)} border border-white shadow z-10 cursor-pointer`}
                      style={position}
                      title={`${sensor.sensorId}: ${sensor.location} (${sensor.health})`}
                      onClick={() => {
                        window.alert(`Sensor: ${sensor.sensorId}\nLocation: ${sensor.location}\nHealth: ${sensor.health}\nBattery: ${sensor.battery}%`);
                      }}
                    />
                  );
                })}

                {/* Center label when no data */}
                {activeAlerts.length === 0 && sensors.length === 0 && (
                  <div className="text-center z-5">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Real-Time Map View</p>
                    <p className="text-sm text-gray-500">No active alerts or sensors</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recent Activity
              </h4>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <div key={alert._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.area}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                
                {criticalSensors.slice(0, 2).map((sensor) => (
                  <div key={sensor._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Sensor Alert: {sensor.sensorId}</p>
                      <p className="text-xs text-muted-foreground">{sensor.location}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Critical
                    </Badge>
                  </div>
                ))}
                
                {activeAlerts.length === 0 && criticalSensors.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap gap-4 text-xs border-t pt-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Sensors</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
