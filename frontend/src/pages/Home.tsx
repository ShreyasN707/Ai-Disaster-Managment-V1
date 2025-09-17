import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { RiskLevelWidget } from "@/components/RiskLevelWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: string;
  location: string;
  dateTime: string;
  description: string;
  severity: "critical" | "high" | "warning" | "moderate" | "low";
}

const recentAlerts: Alert[] = [
  {
    id: "1",
    type: "Active Flood Warning",
    location: "Riverdale District",
    dateTime: "2024-07-20 14:30",
    description: "Heavy rainfall expected, leading to potential flooding in low-lying areas.",
    severity: "high"
  },
  {
    id: "2", 
    type: "Earthquake Advisory",
    location: "Mountain View County",
    dateTime: "2024-07-19 09:15",
    description: "Minor tremors detected, residents advised to prepare for aftershocks.",
    severity: "warning"
  },
  {
    id: "3",
    type: "Active Wildfire Alert", 
    location: "Pine Forest Region",
    dateTime: "2024-07-18 18:00",
    description: "Rapidly spreading wildfire, evacuation orders in effect for surrounding communities.",
    severity: "critical"
  }
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      toast({
        title: "Please provide contact information",
        description: "Enter at least an email address or phone number to subscribe.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Successfully subscribed!",
      description: "You'll receive disaster alerts on your selected channels.",
    });

    setEmail("");
    setPhone("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation userType="public" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            DisasterWatch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed about disasters and emergency situations in your area. 
            Get real-time alerts and access critical safety information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Risk Level Widget */}
          <div className="lg:col-span-1">
            <RiskLevelWidget level="warning" />
          </div>

          {/* Alert Subscription */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Stay Informed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Phone Number (for SMS alerts)
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Notification Method</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email"
                          checked={emailNotifications}
                          onCheckedChange={(checked) => setEmailNotifications(checked === true)}
                        />
                        <label htmlFor="email" className="text-sm text-foreground">
                          Email
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms"
                          checked={smsNotifications}
                          onCheckedChange={(checked) => setSmsNotifications(checked === true)}
                        />
                        <label htmlFor="sms" className="text-sm text-foreground">
                          SMS (Phone)
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full md:w-auto">
                    Subscribe Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Alert Type</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.map((alert) => (
                    <tr key={alert.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={alert.severity}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Badge>
                          <span className="font-medium text-foreground">{alert.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{alert.dateTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-muted-foreground max-w-md">
                        {alert.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}