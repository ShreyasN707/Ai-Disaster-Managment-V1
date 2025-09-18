import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorTable } from "@/components/admin/SensorTable";
import { SensorFormModal } from "@/components/admin/SensorFormModal";
import { SearchBar } from "@/components/shared/SearchBar";
import { Plus, Activity, AlertTriangle, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Shape returned by backend
interface BackendSensor {
  _id: string;
  sensorId: string;
  type: string;
  location: string | { lat?: number; lng?: number; address?: string };
  status: 'online' | 'offline' | 'warning';
  battery: number;
  health: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// Shape used by SensorFormModal
interface FormSensor {
  id?: string;
  name: string; // maps to sensorId
  type: string;
  location: string; // maps to location.address
  status: 'online' | 'offline' | 'warning';
  battery?: number;
}

export default function AdminSensors() {
  const [sensors, setSensors] = useState<BackendSensor[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<BackendSensor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<BackendSensor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const mapBackendToForm = (s: BackendSensor | null): FormSensor | null => {
    if (!s) return null;
    const address = typeof s.location === 'string' ? s.location : (s.location?.address || '');
    return {
      id: s._id,
      name: s.sensorId,
      type: s.type,
      location: address,
      status: s.status,
      battery: s.battery,
    };
  };

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch('http://localhost:4000/api/admin/sensors', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sensors');
        }

        const data = await response.json();
        setSensors(data.sensors || []);
        setFilteredSensors(data.sensors || []);

      } catch (error) {
        console.error('Failed to fetch sensors:', error);
        // Only show toast for non-network errors or if it's the first load
        if (!(error instanceof Error) || !(`${error.message}`.includes('Failed to fetch')) || sensors.length === 0) {
          toast({
            title: "Sensors Load Issue",
            description: "Some data may be unavailable. Retrying automatically...",
            variant: "default",
          });
        }
        // Fallback to prevent UI break
        setSensors([]);
        setFilteredSensors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, [toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = sensors.filter(sensor =>
      sensor.sensorId.toLowerCase().includes(query.toLowerCase()) ||
      sensor.type.toLowerCase().includes(query.toLowerCase()) ||
      ((typeof sensor.location === 'string' 
          ? sensor.location 
          : (sensor.location?.address || `${sensor.location?.lat ?? ''}, ${sensor.location?.lng ?? ''}`))
        .toLowerCase()
        .includes(query.toLowerCase()))
    );
    setFilteredSensors(filtered);
  };

  const handleAddSensor = () => {
    setEditingSensor(null);
    setIsModalOpen(true);
  };

  const handleEditSensor = (sensor: BackendSensor) => {
    setEditingSensor(sensor);
    setIsModalOpen(true);
  };

  const handleDeleteSensor = async (sensorId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/admin/sensors/${sensorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSensors(prev => prev.filter(s => s._id !== sensorId));
        setFilteredSensors(prev => prev.filter(s => s._id !== sensorId));
        toast({
          title: "Sensor deleted",
          description: "Sensor has been successfully removed.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete sensor');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sensor.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSensor = async (sensorData: FormSensor) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        sensorId: sensorData.name,
        type: sensorData.type,
        location: { address: sensorData.location },
        status: sensorData.status,
        battery: sensorData.battery ?? 100,
      } as any;
      
      if (editingSensor) {
        // Update existing sensor
        const response = await fetch(`http://localhost:4000/api/admin/sensors/${editingSensor._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          setSensors(prev => prev.map(s => s._id === editingSensor._id ? data.sensor as BackendSensor : s));
          setFilteredSensors(prev => prev.map(s => s._id === editingSensor._id ? data.sensor as BackendSensor : s));
          toast({
            title: "Sensor updated",
            description: "Sensor information has been successfully updated.",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update sensor');
        }
      } else {
        // Create new sensor
        const response = await fetch('http://localhost:4000/api/admin/sensors', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          setSensors(prev => [...prev, data.sensor as BackendSensor]);
          setFilteredSensors(prev => [...prev, data.sensor as BackendSensor]);
          toast({
            title: "Sensor created",
            description: "New sensor has been successfully created.",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create sensor');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save sensor.",
        variant: "destructive",
      });
    }
  };

  const handleViewLocation = (sensor: BackendSensor) => {
    const loc = typeof sensor.location === 'string' 
      ? sensor.location 
      : (sensor.location?.address || `${sensor.location?.lat ?? ''}, ${sensor.location?.lng ?? ''}`);
    toast({
      title: "Map View",
      description: `Viewing ${sensor.sensorId} on map - ${loc}`,
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
          sensor={mapBackendToForm(editingSensor)}
        />
      </div>
    </SidebarProvider>
  );
}