import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Database, 
  Shield, 
  Key,
  Server,
  Mail,
  Smartphone,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // Alert Thresholds
    criticalThreshold: 90,
    highThreshold: 75,
    moderateThreshold: 50,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    
    // System
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    
    // API Settings
    apiTimeout: 30,
    maxRetries: 3,
    
    // Email Configuration
    smtpServer: 'smtp.disasterwatch.com',
    smtpPort: 587,
    smtpUsername: 'admin@disasterwatch.com',
    
    // SMS Configuration
    smsProvider: 'twilio',
    smsApiKey: '*********************'
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleTestNotification = (type: string) => {
    toast({
      title: "Test Notification Sent",
      description: `Test ${type} notification has been sent to administrators.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">System Settings</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">System Configuration</h2>
              <p className="text-muted-foreground">Configure system-wide parameters and preferences</p>
            </div>

            <Tabs defaultValue="alerts" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="alerts">Alert Thresholds</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="api">API Settings</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Alert Thresholds Tab */}
              <TabsContent value="alerts">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Alert Threshold Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="critical">Critical Threshold (%)</Label>
                        <Input
                          id="critical"
                          type="number"
                          min="0"
                          max="100"
                          value={settings.criticalThreshold}
                          onChange={(e) => handleSettingChange('criticalThreshold', parseInt(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Trigger critical alerts when sensor readings exceed this value
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="high">High Threshold (%)</Label>
                        <Input
                          id="high"
                          type="number"
                          min="0"
                          max="100"
                          value={settings.highThreshold}
                          onChange={(e) => handleSettingChange('highThreshold', parseInt(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Trigger high priority alerts at this threshold
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="moderate">Moderate Threshold (%)</Label>
                        <Input
                          id="moderate"
                          type="number"
                          min="0"
                          max="100"
                          value={settings.moderateThreshold}
                          onChange={(e) => handleSettingChange('moderateThreshold', parseInt(e.target.value))}
                        />
                        <p className="text-sm text-muted-foreground">
                          Trigger moderate alerts at this level
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Notification Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send alerts via email
                          </p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send critical alerts via SMS
                          </p>
                        </div>
                        <Switch
                          checked={settings.smsNotifications}
                          onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Browser push notifications
                          </p>
                        </div>
                        <Switch
                          checked={settings.pushNotifications}
                          onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                        />
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleTestNotification('email')}
                          className="w-full"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Test Email Notification
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleTestNotification('SMS')}
                          className="w-full"
                        >
                          <Smartphone className="mr-2 h-4 w-4" />
                          Test SMS Notification
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Email Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-server">SMTP Server</Label>
                        <Input
                          id="smtp-server"
                          value={settings.smtpServer}
                          onChange={(e) => handleSettingChange('smtpServer', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={settings.smtpPort}
                          onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp-username">SMTP Username</Label>
                        <Input
                          id="smtp-username"
                          value={settings.smtpUsername}
                          onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Server className="h-5 w-5" />
                      <span>System Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Automatic Backup</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable scheduled system backups
                            </p>
                          </div>
                          <Switch
                            checked={settings.autoBackup}
                            onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Backup Frequency</Label>
                          <Select 
                            value={settings.backupFrequency} 
                            onValueChange={(value) => handleSettingChange('backupFrequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">
                              Temporarily disable public access
                            </p>
                          </div>
                          <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                          />
                        </div>

                        <div className="pt-4">
                          <Button variant="outline" className="w-full">
                            <Database className="mr-2 h-4 w-4" />
                            Run Manual Backup
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Settings Tab */}
              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>API Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
                        <Input
                          id="api-timeout"
                          type="number"
                          min="5"
                          max="300"
                          value={settings.apiTimeout}
                          onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-retries">Max Retries</Label>
                        <Input
                          id="max-retries"
                          type="number"
                          min="0"
                          max="10"
                          value={settings.maxRetries}
                          onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Security Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>System Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Configure security policies and access controls
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Key className="mr-2 h-4 w-4" />
                        Regenerate API Keys
                      </Button>
                      <Button variant="outline">
                        <Shield className="mr-2 h-4 w-4" />
                        View Security Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} size="lg">
                Save All Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}