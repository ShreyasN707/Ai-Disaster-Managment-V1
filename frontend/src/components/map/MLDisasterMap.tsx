import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MapPin, AlertTriangle, Activity, RefreshCw, Layers, Brain, Zap } from 'lucide-react';
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

interface MLPrediction {
  id: string;
  type: 'landslide' | 'flood' | 'earthquake' | 'fire';
  probability: number;
  coordinates: [number, number];
  radius: number;
  confidence: number;
  timestamp: string;
}

interface MLDisasterMapProps {
  height?: string;
  showControls?: boolean;
  alerts?: Alert[];
  sensors?: Sensor[];
}

export default function MLDisasterMap({ 
  height = '500px', 
  showControls = true, 
  alerts = [], 
  sensors = [] 
}: MLDisasterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showMLOverlay, setShowMLOverlay] = useState(true);
  const [mlPredictions, setMLPredictions] = useState<MLPrediction[]>([]);
  const [lastMLUpdate, setLastMLUpdate] = useState<Date>(new Date());
  const { token } = useAuth();

  // Initialize map with canvas for better rendering
  useEffect(() => {
    if (!mapRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = '100%';
    canvas.style.height = height;
    canvas.style.border = '2px solid #e2e8f0';
    canvas.style.borderRadius = '12px';
    canvas.style.backgroundColor = '#f8fafc';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base map
    drawBaseMap(ctx);
    
    // Draw ML overlay if enabled
    if (showMLOverlay) {
      drawMLOverlay(ctx);
    }

    // Draw markers
    if (showAlerts) {
      drawAlertMarkers(ctx);
    }
    
    if (showSensors) {
      drawSensorMarkers(ctx);
    }

  }, [height, showAlerts, showSensors, showMLOverlay, alerts, sensors, mlPredictions]);

  // Fetch ML predictions
  const fetchMLPredictions = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ml/predictions', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMLPredictions(data.predictions || []);
        setLastMLUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching ML predictions:', error);
      // Generate mock predictions for demo
      generateMockMLPredictions();
    }
  };

  // Generate mock ML predictions
  const generateMockMLPredictions = () => {
    const mockPredictions: MLPrediction[] = [
      {
        id: 'pred1',
        type: 'landslide',
        probability: 0.85,
        coordinates: [300, 200],
        radius: 50,
        confidence: 0.92,
        timestamp: new Date().toISOString()
      },
      {
        id: 'pred2',
        type: 'flood',
        probability: 0.65,
        coordinates: [500, 350],
        radius: 80,
        confidence: 0.78,
        timestamp: new Date().toISOString()
      },
      {
        id: 'pred3',
        type: 'fire',
        probability: 0.45,
        coordinates: [250, 400],
        radius: 30,
        confidence: 0.68,
        timestamp: new Date().toISOString()
      }
    ];
    setMLPredictions(mockPredictions);
    setLastMLUpdate(new Date());
  };

  // Draw base map
  const drawBaseMap = (ctx: CanvasRenderingContext2D) => {
    // Draw background grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 800; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y <= 600; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Draw city outline
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.fillRect(100, 100, 600, 400);
    ctx.strokeRect(100, 100, 600, 400);

    // Draw districts
    const districts = [
      { name: 'Downtown', x: 200, y: 150, width: 150, height: 100, color: '#ddd6fe' },
      { name: 'Riverside', x: 400, y: 130, width: 120, height: 80, color: '#bfdbfe' },
      { name: 'Industrial', x: 180, y: 280, width: 180, height: 90, color: '#fed7d7' },
      { name: 'Residential', x: 420, y: 250, width: 160, height: 120, color: '#d1fae5' },
      { name: 'Business', x: 500, y: 400, width: 140, height: 80, color: '#fef3c7' },
    ];

    districts.forEach(district => {
      // Draw district background
      ctx.fillStyle = district.color;
      ctx.fillRect(district.x, district.y, district.width, district.height);
      
      // Draw district border
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.strokeRect(district.x, district.y, district.width, district.height);
      
      // Draw district label
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        district.name, 
        district.x + district.width / 2, 
        district.y + district.height / 2 + 5
      );
    });

    // Draw roads
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    // Horizontal roads
    ctx.beginPath();
    ctx.moveTo(100, 200);
    ctx.lineTo(700, 200);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(100, 350);
    ctx.lineTo(700, 350);
    ctx.stroke();
    
    // Vertical roads
    ctx.beginPath();
    ctx.moveTo(300, 100);
    ctx.lineTo(300, 500);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(500, 100);
    ctx.lineTo(500, 500);
    ctx.stroke();
  };

  // Draw ML overlay with predictions
  const drawMLOverlay = (ctx: CanvasRenderingContext2D) => {
    mlPredictions.forEach(prediction => {
      const [x, y] = prediction.coordinates;
      const radius = prediction.radius;
      
      // Create gradient based on prediction type and probability
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      switch (prediction.type) {
        case 'landslide':
          gradient.addColorStop(0, `rgba(239, 68, 68, ${prediction.probability * 0.6})`);
          gradient.addColorStop(1, `rgba(239, 68, 68, ${prediction.probability * 0.1})`);
          break;
        case 'flood':
          gradient.addColorStop(0, `rgba(59, 130, 246, ${prediction.probability * 0.6})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, ${prediction.probability * 0.1})`);
          break;
        case 'fire':
          gradient.addColorStop(0, `rgba(245, 101, 101, ${prediction.probability * 0.6})`);
          gradient.addColorStop(1, `rgba(245, 101, 101, ${prediction.probability * 0.1})`);
          break;
        default:
          gradient.addColorStop(0, `rgba(156, 163, 175, ${prediction.probability * 0.6})`);
          gradient.addColorStop(1, `rgba(156, 163, 175, ${prediction.probability * 0.1})`);
      }
      
      // Draw prediction area
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw prediction border
      ctx.strokeStyle = getMLColor(prediction.type);
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw prediction icon
      ctx.fillStyle = getMLColor(prediction.type);
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(getMLIcon(prediction.type), x, y - 10);
      
      // Draw probability text
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.fillText(`${Math.round(prediction.probability * 100)}%`, x, y + 5);
    });
  };

  // Draw alert markers
  const drawAlertMarkers = (ctx: CanvasRenderingContext2D) => {
    alerts.forEach((alert, index) => {
      const x = 200 + (index * 100) % 400;
      const y = 200 + Math.floor(index / 4) * 100;
      
      // Draw alert circle
      ctx.fillStyle = getSeverityColor(alert.severity);
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw alert border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Add pulse effect for critical alerts
      if (alert.severity === 'critical') {
        const time = Date.now() / 1000;
        const pulseRadius = 12 + Math.sin(time * 3) * 5;
        ctx.strokeStyle = getSeverityColor(alert.severity);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Draw alert icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('!', x, y + 3);
    });
  };

  // Draw sensor markers
  const drawSensorMarkers = (ctx: CanvasRenderingContext2D) => {
    sensors.forEach((sensor, index) => {
      const x = 150 + (index * 80) % 500;
      const y = 150 + Math.floor(index / 6) * 80;
      
      // Draw sensor square
      ctx.fillStyle = getHealthColor(sensor.health);
      ctx.fillRect(x - 6, y - 6, 12, 12);
      
      // Draw sensor border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 6, y - 6, 12, 12);
      
      // Draw sensor icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('S', x, y + 2);
    });
  };

  // Helper functions
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

  const getMLColor = (type: string): string => {
    switch (type) {
      case 'landslide': return '#ef4444';
      case 'flood': return '#3b82f6';
      case 'fire': return '#f59e0b';
      case 'earthquake': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getMLIcon = (type: string): string => {
    switch (type) {
      case 'landslide': return '⛰️';
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'earthquake': return '🌍';
      default: return '⚠️';
    }
  };

  // Setup real-time updates
  useEffect(() => {
    fetchMLPredictions();
    
    const socket = io('http://localhost:4000');
    
    socket.on('mlPredictionUpdate', (prediction: MLPrediction) => {
      setMLPredictions(prev => {
        const updated = prev.filter(p => p.id !== prediction.id);
        return [...updated, prediction];
      });
      setLastMLUpdate(new Date());
    });

    // Auto-refresh ML predictions every 30 seconds
    const interval = setInterval(fetchMLPredictions, 30000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [token]);

  // Refresh all data
  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchMLPredictions();
    setIsLoading(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI-Powered Disaster Map
            <Badge variant="outline" className="ml-2">
              <Zap className="h-3 w-3 mr-1" />
              Live ML
            </Badge>
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
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Controls */}
          {showControls && (
            <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showAlerts}
                  onCheckedChange={setShowAlerts}
                />
                <label className="text-sm font-medium">
                  Alerts ({alerts.length})
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
                  checked={showMLOverlay}
                  onCheckedChange={setShowMLOverlay}
                />
                <label className="text-sm font-medium">
                  ML Predictions ({mlPredictions.length})
                </label>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div 
          ref={mapRef}
          className="w-full border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center"
          style={{ minHeight: height, position: 'relative' }}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{
              width: '100%',
              height: height,
              background: '#f8fafc',
              display: 'block',
              zIndex: 2
            }}
            className="cursor-pointer"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = (e.clientX - rect.left) * (800 / rect.width);
                const y = (e.clientY - rect.top) * (600 / rect.height);
                console.log('Map clicked at:', x, y);
              }
            }}
          />
          {(!mapRef.current || !canvasRef.current) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <span className="text-red-600 font-bold">Map failed to load (no ref)</span>
            </div>
          )}
        </div>
        {/* Debug: log when canvas is drawn */}


          {/* ML Predictions Panel */}
          {showMLOverlay && mlPredictions.length > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Active ML Predictions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {mlPredictions.map((prediction) => (
                  <div key={prediction.id} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {getMLIcon(prediction.type)} {prediction.type}
                      </span>
                      <Badge variant="outline" style={{ color: getMLColor(prediction.type) }}>
                        {Math.round(prediction.probability * 100)}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {Math.round(prediction.confidence * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated: {new Date(prediction.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-purple-700">
                Last ML Update: {lastMLUpdate.toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Critical Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>High Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Sensor Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600 opacity-60"></div>
              <span>ML Prediction</span>
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
              <div className="text-2xl font-bold text-green-600">
                {sensors.filter(s => s.status === 'online').length}
              </div>
              <div className="text-sm text-muted-foreground">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mlPredictions.filter(p => p.probability > 0.7).length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mlPredictions.length}
              </div>
              <div className="text-sm text-muted-foreground">Predictions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
