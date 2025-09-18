import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Crosshair,
  Layers,
  Zap,
  Navigation,
  Satellite
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Alert {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  area: string;
  active: boolean;
  createdAt: string;
  coordinates?: [number, number]; // [lat, lng]
}

interface Sensor {
  _id: string;
  sensorId: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  health: 'good' | 'warning' | 'critical';
  battery: number;
  location: string;
  coordinates?: [number, number]; // [lat, lng]
}

interface RealTimeGPSMapProps {
  className?: string;
  height?: string;
}

// Custom marker icons
const createCustomIcon = (color: string, type: 'alert' | 'sensor') => {
  const size = type === 'alert' ? 25 : 20;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">
        ${type === 'alert' ? '!' : 'S'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Real-time location tracker component
function LocationTracker({ onLocationFound }: { onLocationFound: (latlng: L.LatLng) => void }) {
  const map = useMap();
  
  useMapEvents({
    locationfound: (e) => {
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, 13);
    },
  });

  return null;
}

// Heat map overlay component
function HeatMapOverlay({ alerts }: { alerts: Alert[] }) {
  const map = useMap();

  useEffect(() => {
    // Create heat map circles for high-density alert areas
    const heatCircles: L.Circle[] = [];
    
    alerts.forEach((alert) => {
      if (alert.coordinates && alert.active) {
        const intensity = alert.severity === 'critical' ? 0.8 : 
                         alert.severity === 'high' ? 0.6 : 
                         alert.severity === 'moderate' ? 0.4 : 0.2;
        
        const circle = L.circle(alert.coordinates, {
          radius: 1000, // 1km radius
          fillColor: getSeverityColor(alert.severity),
          fillOpacity: intensity * 0.3,
          stroke: false,
        }).addTo(map);
        
        heatCircles.push(circle);
      }
    });

    return () => {
      heatCircles.forEach(circle => map.removeLayer(circle));
    };
  }, [map, alerts]);

  return null;
}

// Default coordinates for major Indian cities (can be configured)
const DEFAULT_COORDINATES: { [key: string]: [number, number] } = {
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.6139, 77.2090],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Downtown': [19.0760, 72.8777],
  'Riverside': [19.0896, 72.8656],
  'Industrial Zone': [19.0625, 72.8908],
  'Residential Area': [19.0896, 72.8656],
  'Business District': [19.0760, 72.8777],
  'Zone A': [19.0800, 72.8700],
  'Zone B': [19.0700, 72.8800],
  'Zone C': [19.0850, 72.8750],
  'Zone D': [19.0650, 72.8850],
  'Zone E': [19.0900, 72.8650],
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'moderate': return '#d97706';
    case 'low': return '#65a30d';
    default: return '#6b7280';
  }
};

const getHealthColor = (health: string): string => {
  switch (health) {
    case 'critical': return '#dc2626';
    case 'warning': return '#d97706';
    case 'good': return '#16a34a';
    default: return '#6b7280';
  }
};

const getCoordinatesForArea = (area: string): [number, number] => {
  return DEFAULT_COORDINATES[area] || DEFAULT_COORDINATES['Mumbai'];
};

export default function RealTimeGPSMap({ className, height = '500px' }: RealTimeGPSMapProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.0760, 72.8777]); // Mumbai
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const mapRef = useRef<L.Map | null>(null);
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
          const alertsWithCoords = (alertsData.alerts || []).map((alert: Alert) => ({
            ...alert,
            coordinates: alert.coordinates || getCoordinatesForArea(alert.area)
          }));
          setAlerts(alertsWithCoords);
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
            const sensorsWithCoords = (sensorsData.sensors || []).map((sensor: Sensor) => ({
              ...sensor,
              coordinates: sensor.coordinates || getCoordinatesForArea(sensor.location)
            }));
            setSensors(sensorsWithCoords);
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
      const alertWithCoords = {
        ...newAlert,
        coordinates: newAlert.coordinates || getCoordinatesForArea(newAlert.area)
      };
      setAlerts(prev => [alertWithCoords, ...prev]);
      setLastUpdate(new Date());
    });

    socket.on('alertUpdated', (updatedAlert: Alert) => {
      const alertWithCoords = {
        ...updatedAlert,
        coordinates: updatedAlert.coordinates || getCoordinatesForArea(updatedAlert.area)
      };
      setAlerts(prev => prev.map(alert => 
        alert._id === updatedAlert._id ? alertWithCoords : alert
      ));
      setLastUpdate(new Date());
    });

    socket.on('sensorUpdate', (updatedSensor: Sensor) => {
      const sensorWithCoords = {
        ...updatedSensor,
        coordinates: updatedSensor.coordinates || getCoordinatesForArea(updatedSensor.location)
      };
      setSensors(prev => prev.map(sensor => 
        sensor._id === updatedSensor._id ? sensorWithCoords : sensor
      ));
      setLastUpdate(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
          setShowUserLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const activeAlerts = alerts.filter(alert => alert.active);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const onlineSensors = sensors.filter(sensor => sensor.status === 'online');

  const getTileLayerUrl = () => {
    return mapStyle === 'satellite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  const getTileLayerAttribution = () => {
    return mapStyle === 'satellite'
      ? '&copy; <a href="https://www.esri.com/">Esri</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Real-Time GPS Disaster Map
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live GPS
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Map Controls */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showAlerts}
                  onCheckedChange={setShowAlerts}
                />
                <label className="text-sm font-medium">
                  Alerts ({activeAlerts.length})
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showSensors}
                  onCheckedChange={setShowSensors}
                />
                <label className="text-sm font-medium">
                  Sensors ({sensors.length})
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showHeatMap}
                  onCheckedChange={setShowHeatMap}
                />
                <label className="text-sm font-medium">
                  Heat Map
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getUserLocation}
              >
                <Navigation className="h-4 w-4 mr-1" />
                My Location
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
              >
                <Satellite className="h-4 w-4 mr-1" />
                {mapStyle === 'street' ? 'Satellite' : 'Street'}
              </Button>
            </div>

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
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {userLocation ? '1' : '0'}
                </div>
                <div className="text-sm text-blue-700">GPS Tracking</div>
              </div>
            </div>

            {/* GPS Map */}
            <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url={getTileLayerUrl()}
                  attribution={getTileLayerAttribution()}
                />

                {/* Location Tracker */}
                <LocationTracker onLocationFound={(latlng) => {
                  setUserLocation([latlng.lat, latlng.lng]);
                }} />

                {/* Heat Map Overlay */}
                {showHeatMap && <HeatMapOverlay alerts={activeAlerts} />}

                {/* User Location Marker */}
                {showUserLocation && userLocation && (
                  <Marker position={userLocation}>
                    <Popup>
                      <div className="text-center">
                        <Crosshair className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <strong>Your Location</strong>
                        <br />
                        <small>Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}</small>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Alert Markers */}
                {showAlerts && activeAlerts.map((alert) => (
                  alert.coordinates && (
                    <Marker
                      key={alert._id}
                      position={alert.coordinates}
                      icon={createCustomIcon(getSeverityColor(alert.severity), 'alert')}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <div className="flex items-center justify-between mb-2">
                            <strong className="text-sm">{alert.title || alert.message}</strong>
                            <Badge 
                              variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                              className="ml-2"
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.area}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(alert.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}

                {/* Sensor Markers */}
                {showSensors && sensors.map((sensor) => (
                  sensor.coordinates && (
                    <Marker
                      key={sensor._id}
                      position={sensor.coordinates}
                      icon={createCustomIcon(getHealthColor(sensor.health), 'sensor')}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <div className="flex items-center justify-between mb-2">
                            <strong className="text-sm">{sensor.sensorId}</strong>
                            <Badge 
                              variant={sensor.health === 'critical' ? 'destructive' : 
                                     sensor.health === 'warning' ? 'outline' : 'secondary'}
                              className="ml-2"
                            >
                              {sensor.health}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{sensor.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-3 w-3" />
                              <span>Status: {sensor.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3" />
                              <span>Battery: {sensor.battery}%</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap gap-4 text-xs border-t pt-3">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                <span>Critical Alert</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                <span>High Alert</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
                <span>Moderate Alert</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                <span>Sensor Online</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
                <span>Your Location</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
