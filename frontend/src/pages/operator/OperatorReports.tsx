import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/operator/OperatorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportForm } from "@/components/operator/ReportForm";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import io from 'socket.io-client';

interface Report {
  _id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved';
  location: string;
  relatedSensor?: string;
  operatorId: string;
  operatorName: string;
  reviewedBy?: {
    _id: string;
    name: string;
  };
  resolvedBy?: {
    _id: string;
    name: string;
  };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  attachments: any[];
}


export default function OperatorReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { token } = useAuth();

  // Fetch operator's reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/operator/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit new report
  const handleSubmitReport = async (reportData: any) => {
    try {
      console.log('🚀 Submitting report:', reportData);
      console.log('🔑 Token available:', !!token);

      if (!token) {
        throw new Error('No authentication token available');
      }

      const payload = {
        title: reportData.title,
        description: reportData.description,
        severity: reportData.severity,
        location: reportData.location,
        relatedSensor: reportData.relatedSensor
      };

      console.log('📤 Payload:', payload);

      const response = await fetch('/api/operator/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Report submitted successfully:', data);
        setReports(prev => [data.report, ...prev]);
        
        toast({
          title: "Success",
          description: data.message
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }

    // Setup WebSocket for real-time updates
    const socket = io();
    
    socket.on('reportUpdated', (updatedReport: Report) => {
      setReports(prev => prev.map(report => 
        report._id === updatedReport._id ? updatedReport : report
      ));
      
      if (updatedReport.status === 'reviewed') {
        toast({
          title: "Report Reviewed",
          description: `Your report "${updatedReport.title}" has been reviewed by admin.`
        });
      } else if (updatedReport.status === 'resolved') {
        toast({
          title: "Report Resolved",
          description: `Your report "${updatedReport.title}" has been resolved.`
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, toast]);

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
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading reports...
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No reports submitted yet. Submit your first report using the form.
                      </div>
                    ) : (
                      reports.map((report) => (
                        <div key={report._id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-muted-foreground">
                                {report._id}
                              </span>
                              {getSeverityBadge(report.severity)}
                            </div>
                            {getStatusBadge(report.status)}
                          </div>
                          
                          <h4 className="font-medium mb-2">{report.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {report.description}
                          </p>
                          
                          {report.relatedSensor && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Related Sensor: {report.relatedSensor}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{report.location}</span>
                            <span>{new Date(report.createdAt).toLocaleString()}</span>
                          </div>
                          
                          {report.attachments && report.attachments.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">
                                {report.attachments.length} attachment{report.attachments.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          
                          {report.adminNotes && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <strong>Admin Notes:</strong> {report.adminNotes}
                            </div>
                          )}
                        </div>
                      ))
                    )}
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