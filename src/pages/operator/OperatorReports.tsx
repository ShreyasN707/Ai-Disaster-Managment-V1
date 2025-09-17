import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportForm } from "@/components/operator/ReportForm";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved';
  location: string;
  createdAt: string;
  attachments?: number;
}

const mockReports: Report[] = [
  {
    id: 'INC005',
    title: 'Sensor calibration completed',
    description: 'Regular maintenance and calibration of river sensor',
    severity: 'low',
    status: 'resolved',
    location: 'Riverfront District, Sector C',
    createdAt: '2024-01-15 10:30',
    attachments: 2
  },
  {
    id: 'INC004',
    title: 'Equipment anomaly detected',
    description: 'Unusual readings from air quality monitor',
    severity: 'moderate',
    status: 'reviewed',
    location: 'Industrial Zone North',
    createdAt: '2024-01-14 14:15',
    attachments: 1
  },
  {
    id: 'INC003',
    title: 'Infrastructure inspection',
    description: 'Weekly safety inspection of monitoring equipment',
    severity: 'low',
    status: 'pending',
    location: 'Mountain Base Research Outpost',
    createdAt: '2024-01-14 09:45'
  }
];

export default function OperatorReports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const { toast } = useToast();

  const handleSubmitReport = (reportData: any) => {
    const newReport: Report = {
      id: reportData.id,
      title: reportData.title,
      description: reportData.description,
      severity: reportData.severity,
      status: 'pending',
      location: reportData.location,
      createdAt: new Date().toLocaleString(),
      attachments: reportData.files.length
    };

    setReports(prev => [newReport, ...prev]);
    
    toast({
      title: "Report Submitted",
      description: "Your incident report has been successfully submitted and is pending review.",
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="critical">Critical</Badge>;
      case 'high':
        return <Badge variant="high">High</Badge>;
      case 'moderate':
        return <Badge variant="moderate">Moderate</Badge>;
      default:
        return <Badge variant="low">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="safe">Resolved</Badge>;
      case 'reviewed':
        return <Badge variant="warning">Reviewed</Badge>;
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OperatorSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Incident Reports</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">Incident Reports</h2>
              <p className="text-muted-foreground">Submit new reports and track your submissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.length}</div>
                </CardContent>
              </Card>
              
              <Card className="border-warning/20 bg-warning/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{pendingCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-moderate/20 bg-moderate/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-moderate" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-moderate">{reviewedCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-safe/20 bg-safe/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-safe" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-safe">{resolvedCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Report Form */}
              <div>
                <ReportForm onSubmit={handleSubmitReport} />
              </div>

              {/* Report History */}
              <Card>
                <CardHeader>
                  <CardTitle>Report History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm text-muted-foreground">
                              {report.id}
                            </span>
                            {getSeverityBadge(report.severity)}
                          </div>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <h4 className="font-medium mb-2">{report.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{report.location}</span>
                          <span>{report.createdAt}</span>
                        </div>
                        
                        {report.attachments && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">
                              {report.attachments} attachment{report.attachments > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}