import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorTable } from "@/components/admin/SensorTable";
import { SensorFormModal } from "@/components/admin/SensorFormModal";
import { SearchBar } from "@/components/shared/SearchBar";
import { Plus, Activity, AlertTriangle, Wifi } from "lucide-react";
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
    status: 'offline',
    battery: 12,
    lastReading: '2 hours ago'
  }
];

export default function AdminSensors() {
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>(mockSensors);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
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

  const handleAddSensor = () => {
    setEditingSensor(null);
    setIsModalOpen(true);
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setIsModalOpen(true);
  };

  const handleDeleteSensor = (sensorId: string) => {
    setSensors(prev => prev.filter(s => s.id !== sensorId));
    setFilteredSensors(prev => prev.filter(s => s.id !== sensorId));
    toast({
      title: "Sensor deleted",
      description: "Sensor has been successfully removed.",
    });
  };

  const handleSaveSensor = (sensorData: Sensor) => {
    if (editingSensor) {
      // Update existing sensor
      setSensors(prev => prev.map(s => s.id === editingSensor.id ? { ...sensorData, id: editingSensor.id } : s));
      setFilteredSensors(prev => prev.map(s => s.id === editingSensor.id ? { ...sensorData, id: editingSensor.id } : s));
      toast({
        title: "Sensor updated",
        description: "Sensor information has been successfully updated.",
      });
    } else {
      // Add new sensor
      const newSensor = { 
        ...sensorData, 
        id: `SENS${String(sensors.length + 1).padStart(3, '0')}`,
        lastReading: 'Just now'
      };
      setSensors(prev => [...prev, newSensor]);
      setFilteredSensors(prev => [...prev, newSensor]);
      toast({
        title: "Sensor created",
        description: "New sensor has been successfully created.",
      });
    }
  };

  const handleViewLocation = (sensor: Sensor) => {
    toast({
      title: "Map View",
      description: `Viewing ${sensor.name} on map - ${sensor.location}`,
    });
  };

  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const warningCount = sensors.filter(s => s.status === 'warning').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Sensor Management</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Sensors</h2>
                <p className="text-muted-foreground">Monitor and manage all system sensors</p>
              </div>
              <Button onClick={handleAddSensor}>
                <Plus className="mr-2 h-4 w-4" />
                Add Sensor
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
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

            {/* Search and Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Sensor List</CardTitle>
                  <SearchBar
                    placeholder="Search sensors..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-80"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <SensorTable
                  sensors={filteredSensors}
                  onEdit={handleEditSensor}
                  onDelete={handleDeleteSensor}
                  onViewLocation={handleViewLocation}
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <SensorFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSensor}
          sensor={editingSensor}
        />
      </div>
    </SidebarProvider>
  );
}