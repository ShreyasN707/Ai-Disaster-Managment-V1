import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorCard } from "@/components/operator/SensorCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { Activity, Wifi, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  battery: number;
  lastReading: string;
}

const mockSensors: Sensor[] = [
  {
    id: 'SENS001',
    name: 'River Level Sensor 1',
    type: 'Hydrological Sensor',
    location: 'Riverfront District, Sector C',
    status: 'online',
    battery: 85,
    lastReading: '10 mins ago'
  },
  {
    id: 'SENS002',
    name: 'Air Quality Monitor 3',
    type: 'Environmental Sensor',
    location: 'Industrial Zone North',
    status: 'warning',
    battery: 32,
    lastReading: '5 mins ago'
  },
  {
    id: 'SENS003',
    name: 'Seismic Sensor A',
    type: 'Geological Sensor',
    location: 'Mountain Base Research Outpost',
    status: 'online',
    battery: 78,
    lastReading: '15 mins ago'
  },
  {
    id: 'SENS004',
    name: 'Temperature & Humidity 2',
    type: 'Environmental Sensor',
    location: 'Residential Area 5',
    status: 'offline',
    battery: 15,
    lastReading: '2 hours ago'
  },
  {
    id: 'SENS005',
    name: 'Water Quality Probe',
    type: 'Hydrological Sensor',
    location: 'Lakeview Pumping Station',
    status: 'online',
    battery: 92,
    lastReading: '8 mins ago'
  },
  {
    id: 'SENS006',
    name: 'Wind Speed Sensor',
    type: 'Meteorological Sensor',
    location: 'Coastal Observation Post',
    status: 'warning',
    battery: 28,
    lastReading: '12 mins ago'
  }
];

export default function OperatorSensors() {
  const [sensors] = useState<Sensor[]>(mockSensors);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>(mockSensors);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = sensors.filter(sensor =>
      sensor.name.toLowerCase().includes(query.toLowerCase()) ||
      sensor.type.toLowerCase().includes(query.toLowerCase()) ||
      sensor.location.toLowerCase().includes(query.toLowerCase()) ||
      sensor.id.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSensors(filtered);
  };

  const handleViewDetails = (sensor: Sensor) => {
    toast({
      title: "Sensor Details",
      description: `Viewing detailed information for ${sensor.name}`,
    });
  };

  const handleCalibrate = (sensorId: string) => {
    toast({
      title: "Calibration Started",
      description: `Initiating calibration for sensor ${sensorId}`,
    });
  };

  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OperatorSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Sensor Management</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">My Sensors</h2>
                <p className="text-muted-foreground">Monitor and manage your assigned sensors</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensors.length}</div>
                </CardContent>
              </Card>
              
              <Card className="border-safe/20 bg-safe/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online</CardTitle>
                  <Wifi className="h-4 w-4 text-safe" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-safe">{onlineCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-warning/20 bg-warning/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warning</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{warningCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-critical/20 bg-critical/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Offline</CardTitle>
                  <Activity className="h-4 w-4 text-critical" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-critical">{offlineCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Sensor Grid */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sensor Status</CardTitle>
                  <SearchBar
                    placeholder="Search sensors..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-80"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSensors.map((sensor) => (
                    <SensorCard
                      key={sensor.id}
                      sensor={sensor}
                      onViewDetails={handleViewDetails}
                      onCalibrate={handleCalibrate}
                    />
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