import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Sensor {
  id?: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  battery?: number;
}

interface SensorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sensor: Sensor) => void;
  sensor?: Sensor | null;
}

const sensorTypes = [
  "Hydrological Sensor",
  "Environmental Sensor",
  "Geological Sensor",
  "Meteorological Sensor",
  "Air Quality Monitor",
  "Seismic Sensor",
  "Temperature & Humidity",
  "Water Quality Probe",
  "Wind Speed Sensor"
];

export function SensorFormModal({ isOpen, onClose, onSave, sensor }: SensorFormModalProps) {
  const [formData, setFormData] = useState<Sensor>({
    name: '',
    type: '',
    location: '',
    status: 'online',
    battery: 100
  });

  useEffect(() => {
    if (sensor) {
      setFormData(sensor);
    } else {
      setFormData({
        name: '',
        type: '',
        location: '',
        status: 'online',
        battery: 100
      });
    }
  }, [sensor, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field: keyof Sensor, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {sensor ? 'Edit Sensor' : 'Add New Sensor'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sensor Name</Label>
            <Input
              id="name"
              placeholder="e.g., River Level Sensor 1"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Sensor Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sensor type" />
              </SelectTrigger>
              <SelectContent>
                {sensorTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Riverfront District, Sector C"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="battery">Battery Level (%)</Label>
            <Input
              id="battery"
              type="number"
              min="0"
              max="100"
              value={formData.battery || ''}
              onChange={(e) => handleChange('battery', parseInt(e.target.value) || 0)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {sensor ? 'Update' : 'Create'} Sensor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}