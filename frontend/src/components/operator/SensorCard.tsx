import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Battery, MapPin, Clock, Settings } from "lucide-react";

interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  battery: number;
  lastReading: string;
}

interface SensorCardProps {
  sensor: Sensor;
  onViewDetails?: (sensor: Sensor) => void;
  onCalibrate?: (sensorId: string) => void;
}

export function SensorCard({ sensor, onViewDetails, onCalibrate }: SensorCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="safe">Online</Badge>;
      case 'offline':
        return <Badge variant="offline">Offline</Badge>;
      case 'warning':
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return "border-safe/20 bg-safe/5";
      case 'offline':
        return "border-critical/20 bg-critical/5";
      case 'warning':
        return "border-warning/20 bg-warning/5";
      default:
        return "border-border";
    }
  };

  return (
    <Card className={`${getStatusColor(sensor.status)} transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{sensor.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{sensor.type}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            {getStatusBadge(sensor.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{sensor.location}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Battery className="h-4 w-4" />
            <span className={getBatteryColor(sensor.battery)}>
              Battery: {sensor.battery}%
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last: {sensor.lastReading}</span>
          </div>

          <div className="flex space-x-2 pt-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(sensor)}
                className="flex-1"
              >
                View Details
              </Button>
            )}
            {onCalibrate && sensor.status !== 'offline' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCalibrate(sensor.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}