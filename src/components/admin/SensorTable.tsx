import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, MoreHorizontal, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  battery: number;
  lastReading: string;
}

interface SensorTableProps {
  sensors: Sensor[];
  onEdit: (sensor: Sensor) => void;
  onDelete: (sensorId: string) => void;
  onViewLocation?: (sensor: Sensor) => void;
}

export function SensorTable({ sensors, onEdit, onDelete, onViewLocation }: SensorTableProps) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sensor ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Battery</TableHead>
            <TableHead>Last Reading</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sensors.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell className="font-mono text-sm">{sensor.id}</TableCell>
              <TableCell className="font-medium">{sensor.name}</TableCell>
              <TableCell>{sensor.type}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{sensor.location}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(sensor.status)}</TableCell>
              <TableCell>
                <span className={getBatteryColor(sensor.battery)}>
                  {sensor.battery}%
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {sensor.lastReading}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(sensor)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {onViewLocation && (
                      <DropdownMenuItem onClick={() => onViewLocation(sensor)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        View on Map
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(sensor.id)}
                      className="text-critical"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}