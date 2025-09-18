import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Activity, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import io from 'socket.io-client';

interface Alert {
  _id: string;
  title: string;
  message: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  area: string;
  location?: {
    coordinates: [number, number];
  };
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
  coordinates?: [number, number];
}

interface DisasterMapProps {
  height?: string;
  showControls?: boolean;
  alerts?: Alert[];
  sensors?: Sensor[];
}

// Mock coordinates for different areas (in a real app, these would come from the database)
const AREA_COORDINATES: { [key: string]: [number, number] } = {
  'Downtown': [40.7128, -74.0060],
  'Riverside': [40.7589, -73.9851],
  'Industrial Zone': [40.6892, -74.0445],
  'Residential Area': [40.7831, -73.9712],
  'Business District': [40.7505, -73.9934],
  'Zone A': [40.7200, -74.0100],
  'Zone B': [40.7300, -73.9900],
  'Zone C': [40.7400, -74.0200],
  'Zone D': [40.7100, -73.9800],
  'Zone E': [40.7500, -74.0300],
};

export default function DisasterMap({ 
  height = '400px', 
  showControls = true, 
  alerts = [], 
  sensors = [] 
}: DisasterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showRiskOverlay, setShowRiskOverlay] = useState(false);
  const { token } = useAuth();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create a simple SVG-based map since we don't have Leaflet installed yet
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';

    // Create SVG map
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.style.border = '1px solid #e2e8f0';
    svg.style.borderRadius = '8px';
    svg.style.backgroundColor = '#f8fafc';

    // Add background pattern
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', '50');
    pattern.setAttribute('height', '50');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 50 0 L 0 0 0 50');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#e2e8f0');
    path.setAttribute('stroke-width', '1');
    
    pattern.appendChild(path);
    defs.appendChild(pattern);
    svg.appendChild(defs);

    // Add grid background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#grid)');
    svg.appendChild(rect);

    // Add city outline (simplified)
    const cityPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    cityPath.setAttribute('d', 'M 100 100 L 700 100 L 700 500 L 100 500 Z M 200 150 L 600 150 L 600 450 L 200 450 Z');
    cityPath.setAttribute('fill', '#e2e8f0');
    cityPath.setAttribute('stroke', '#94a3b8');
    cityPath.setAttribute('stroke-width', '2');
    svg.appendChild(cityPath);

    // Add districts
    const districts = [
      { name: 'Downtown', x: 250, y: 200, width: 150, height: 100 },
      { name: 'Riverside', x: 450, y: 180, width: 120, height: 80 },
      { name: 'Industrial', x: 200, y: 320, width: 180, height: 90 },
      { name: 'Residential', x: 420, y: 300, width: 160, height: 120 },
    ];

    districts.forEach(district => {
      const districtRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      districtRect.setAttribute('x', district.x.toString());
      districtRect.setAttribute('y', district.y.toString());
      districtRect.setAttribute('width', district.width.toString());
      districtRect.setAttribute('height', district.height.toString());
      districtRect.setAttribute('fill', '#f1f5f9');
      districtRect.setAttribute('stroke', '#cbd5e1');
      districtRect.setAttribute('stroke-width', '1');
      districtRect.setAttribute('rx', '4');
      svg.appendChild(districtRect);

      // Add district label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', (district.x + district.width / 2).toString());
      label.setAttribute('y', (district.y + district.height / 2).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('font-size', '12');
      label.setAttribute('font-weight', '500');
      label.setAttribute('fill', '#64748b');
      label.textContent = district.name;
      svg.appendChild(label);
    });

    mapContainer.appendChild(svg);
    setMapInstance(svg);
  }, [height]);

  // Add markers for alerts and sensors
  useEffect(() => {
    if (!mapInstance) return;

    // Remove existing markers
    const existingMarkers = mapInstance.querySelectorAll('.marker');
    existingMarkers.forEach((marker: Element) => marker.remove());

    // Add alert markers
    if (showAlerts) {
      alerts.forEach((alert, index) => {
        const coords = getCoordinatesForArea(alert.area);
        const marker = createMarker(coords[0], coords[1], 'alert', alert.severity, alert.title);
        mapInstance.appendChild(marker);
      });
    }

    // Add sensor markers
    if (showSensors) {
      sensors.forEach((sensor, index) => {
        const coords = getCoordinatesForArea(sensor.location);
        const marker = createMarker(coords[0], coords[1], 'sensor', sensor.health, sensor.sensorId);
        mapInstance.appendChild(marker);
      });
    }
  }, [mapInstance, alerts, sensors, showAlerts, showSensors]);

  // Convert area name to map coordinates
  const getCoordinatesForArea = (area: string): [number, number] => {
    // Map real coordinates to SVG coordinates (simplified mapping)
    const baseCoords = AREA_COORDINATES[area] || [40.7128, -74.0060];
    
    // Convert to SVG coordinates (this is a simplified transformation)
    const x = 200 + Math.random() * 400; // Random position within city bounds
    const y = 150 + Math.random() * 300;
    
    return [x, y];
  };

  // Create SVG marker
  const createMarker = (x: number, y: number, type: 'alert' | 'sensor', severity: string, title: string) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'marker');
    group.setAttribute('transform', `translate(${x}, ${y})`);

    // Marker circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', type === 'alert' ? '8' : '6');
    circle.setAttribute('fill', getMarkerColor(type, severity));
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '2');
    
    // Pulse animation for critical alerts
    if (type === 'alert' && severity === 'critical') {
      const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulseCircle.setAttribute('r', '8');
      pulseCircle.setAttribute('fill', 'none');
      pulseCircle.setAttribute('stroke', getMarkerColor(type, severity));
      pulseCircle.setAttribute('stroke-width', '2');
      pulseCircle.setAttribute('opacity', '0.7');
      
      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animate.setAttribute('attributeName', 'r');
      animate.setAttribute('values', '8;16;8');
      animate.setAttribute('dur', '2s');
      animate.setAttribute('repeatCount', 'indefinite');
      
      const animateOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animateOpacity.setAttribute('attributeName', 'opacity');
      animateOpacity.setAttribute('values', '0.7;0;0.7');
      animateOpacity.setAttribute('dur', '2s');
      animateOpacity.setAttribute('repeatCount', 'indefinite');
      
      pulseCircle.appendChild(animate);
      pulseCircle.appendChild(animateOpacity);
      group.appendChild(pulseCircle);
    }

    group.appendChild(circle);

    // Add tooltip
    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tooltip.textContent = `${type.toUpperCase()}: ${title} (${severity})`;
    group.appendChild(tooltip);

    // Add click handler
    group.style.cursor = 'pointer';
    group.addEventListener('click', () => {
      alert(`${type.toUpperCase()}: ${title}\nSeverity: ${severity}`);
    });

    return group;
  };

  // Get marker color based on type and severity
  const getMarkerColor = (type: 'alert' | 'sensor', severity: string): string => {
    if (type === 'alert') {
      switch (severity) {
        case 'critical': return '#dc2626';
        case 'high': return '#ea580c';
        case 'moderate': return '#d97706';
        case 'low': return '#65a30d';
        default: return '#6b7280';
      }
    } else {
      switch (severity) {
        case 'critical': return '#dc2626';
        case 'warning': return '#d97706';
        case 'good': return '#16a34a';
        default: return '#6b7280';
      }
    }
  };

  // Refresh map data
  const handleRefresh = async () => {
    setIsLoading(true);
    // In a real app, this would fetch fresh data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Toggle risk overlay
  const toggleRiskOverlay = () => {
    setShowRiskOverlay(!showRiskOverlay);
    
    if (!showRiskOverlay && mapInstance) {
      // Add risk overlay
      const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      overlay.setAttribute('class', 'risk-overlay');
      overlay.setAttribute('x', '200');
      overlay.setAttribute('y', '150');
      overlay.setAttribute('width', '400');
      overlay.setAttribute('height', '300');
      overlay.setAttribute('fill', 'rgba(239, 68, 68, 0.2)');
      overlay.setAttribute('stroke', '#ef4444');
      overlay.setAttribute('stroke-width', '2');
      overlay.setAttribute('stroke-dasharray', '5,5');
      mapInstance.appendChild(overlay);

      // Add overlay label
      const overlayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      overlayLabel.setAttribute('class', 'risk-overlay');
      overlayLabel.setAttribute('x', '400');
      overlayLabel.setAttribute('y', '170');
      overlayLabel.setAttribute('text-anchor', 'middle');
      overlayLabel.setAttribute('font-size', '14');
      overlayLabel.setAttribute('font-weight', 'bold');
      overlayLabel.setAttribute('fill', '#ef4444');
      overlayLabel.textContent = 'HIGH RISK ZONE';
      mapInstance.appendChild(overlayLabel);
    } else if (mapInstance) {
      // Remove risk overlay
      const overlays = mapInstance.querySelectorAll('.risk-overlay');
      overlays.forEach((overlay: Element) => overlay.remove());
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Disaster Management Map
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRiskOverlay}
              >
                <Layers className="h-4 w-4" />
                {showRiskOverlay ? 'Hide' : 'Show'} Risk
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Controls */}
          {showControls && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showAlerts ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAlerts(!showAlerts)}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Alerts ({alerts.length})
              </Button>
              <Button
                variant={showSensors ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSensors(!showSensors)}
              >
                <Activity className="h-4 w-4 mr-1" />
                Sensors ({sensors.length})
              </Button>
            </div>
          )}

          {/* Map Container */}
          <div 
            ref={mapRef} 
            className="w-full border rounded-lg overflow-hidden"
            style={{ height }}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Critical Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>High Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span>Moderate Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Sensor Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              <span>Sensor Offline</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {alerts.filter(a => a.severity === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sensors.filter(s => s.status === 'online').length}
              </div>
              <div className="text-sm text-muted-foreground">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {sensors.filter(s => s.status === 'offline').length}
              </div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
