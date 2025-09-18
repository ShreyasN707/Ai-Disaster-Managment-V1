import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { RiskLevelWidget } from "@/components/RiskLevelWidget";
import MLDisasterMap from "@/components/map/MLDisasterMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/lib/api";

interface Alert {
  _id: string;
  message: string;
  area: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  // Fetch real alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/public/alerts');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch alerts`);
        }
        
        const data = await response.json();
        console.log('Fetched alerts data:', data); // Debug log
        
        if (data.alerts) {
          setAlerts(data.alerts);
        } else {
          console.warn('No alerts property in response:', data);
          setAlerts([]);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        toast({
          title: "Failed to load alerts",
          description: error.message || "Unable to fetch the latest alerts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up polling for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      toast({
        title: "Please provide contact information",
        description: "Enter at least an email address or phone number to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setSubscribing(true);

    try {
      const subscriptionData: any = {
        alertTypes: ['all']
      };

      if (emailNotifications && email) {
        subscriptionData.email = email;
      }

      if (smsNotifications && phone) {
        subscriptionData.phone = phone;
      }

      const response = await fetch('http://localhost:4000/api/public/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Successfully subscribed!",
          description: data.message || "You'll receive disaster alerts on your selected channels.",
        });
        setEmail("");
        setPhone("");
      } else {
        toast({
          title: "Subscription failed",
          description: data.message || "Unable to subscribe. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Unable to subscribe. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
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
                  
                  <Button type="submit" className="w-full md:w-auto" disabled={subscribing}>
                    {subscribing ? "Subscribing..." : "Subscribe Now"}
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
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Loading alerts...
                      </td>
                    </tr>
                  ) : alerts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No active alerts at this time.
                      </td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert._id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-2">
                          <Badge 
                            variant={alert.severity === 'critical' ? 'destructive' : 
                                    alert.severity === 'high' ? 'default' : 'outline'}
                            className="capitalize"
                          >
                            {alert.severity}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{alert.area || 'Multiple areas'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="line-clamp-1">{alert.message}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Public Map View */}
        <div className="mt-8">
          <MLDisasterMap 
            height="400px" 
            showControls={false}
            alerts={alerts.filter(alert => alert.active).map(alert => ({
              ...alert,
              title: alert.message, // Map message to title for compatibility
              severity: alert.severity as 'low' | 'moderate' | 'high' | 'critical'
            }))}
            sensors={[]} 
          />
        </div>
      </main>
    </div>
  );
}