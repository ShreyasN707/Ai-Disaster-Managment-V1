import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  X,
  Calendar,
  MapPin,
  User
} from "lucide-react";
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
  operatorName: string;
  operatorId: {
    _id: string;
    name: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
  };
  resolvedBy?: {
    _id: string;
    name: string;
  };
  adminNotes?: string;
  relatedSensor?: string;
  createdAt: string;
  updatedAt: string;
  attachments: any[];
}


export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [updatingReport, setUpdatingReport] = useState<string | null>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setFilteredReports(data.reports);
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

  // Update report status
  const updateReportStatus = async (reportId: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setReports(prev => prev.map(report => 
          report._id === reportId ? data.report : report
        ));
        setFilteredReports(prev => prev.map(report => 
          report._id === reportId ? data.report : report
        ));
        
        toast({
          title: "Success",
          description: data.message
        });
      } else {
        throw new Error('Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
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
    
    socket.on('newReport', (newReport: Report) => {
      setReports(prev => [newReport, ...prev]);
      setFilteredReports(prev => [newReport, ...prev]);
      toast({
        title: "New Report",
        description: `New report submitted: ${newReport.title}`
      });
    });

    socket.on('reportUpdated', (updatedReport: Report) => {
      setReports(prev => prev.map(report => 
        report._id === updatedReport._id ? updatedReport : report
      ));
      setFilteredReports(prev => prev.map(report => 
        report._id === updatedReport._id ? updatedReport : report
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, severityFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, severityFilter);
  };

  const handleSeverityFilter = (severity: string) => {
    setSeverityFilter(severity);
    applyFilters(searchQuery, statusFilter, severity);
  };

  const applyFilters = (search: string, status: string, severity: string) => {
    let filtered = reports;

    if (search) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.description.toLowerCase().includes(search.toLowerCase()) ||
        report.operatorName.toLowerCase().includes(search.toLowerCase()) ||
        report.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(report => report.status === status);
    }

    if (severity !== 'all') {
      filtered = filtered.filter(report => report.severity === severity);
    }

    setFilteredReports(filtered);
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

  const handleViewReport = (reportId: string) => {
    const report = reports.find(r => r._id === reportId);
    if (report) {
      setSelectedReport(report);
      setIsViewModalOpen(true);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: string, adminNotes?: string) => {
    try {
      setUpdatingReport(reportId);
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });

      if (response.ok) {
        const data = await response.json();
        setReports(prev => prev.map(report => 
          report._id === reportId ? data.report : report
        ));
        toast({
          title: "Success",
          description: data.message
        });
        setIsViewModalOpen(false);
      } else {
        throw new Error('Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingReport(null);
    }
  };

  const handleExportReports = () => {
    try {
      // Create CSV content
      const headers = ['Report ID', 'Title', 'Description', 'Severity', 'Status', 'Location', 'Operator', 'Created At', 'Updated At'];
      const csvContent = [
        headers.join(','),
        ...filteredReports.map(report => [
          report._id,
          `"${report.title.replace(/"/g, '""')}"`,
          `"${report.description.replace(/"/g, '""')}"`,
          report.severity,
          report.status,
          `"${report.location.replace(/"/g, '""')}"`,
          `"${report.operatorName || 'Unknown'}"`,
          new Date(report.createdAt).toLocaleString(),
          new Date(report.updatedAt).toLocaleString()
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `disaster_reports_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `${filteredReports.length} reports exported to CSV file.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export reports. Please try again.",
        variant: "destructive"
      });
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const criticalCount = reports.filter(r => r.severity === 'critical').length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1">
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Reports Management</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Incident Reports</h2>
                <p className="text-muted-foreground">Review and manage operator incident reports</p>
              </div>
              <Button onClick={handleExportReports}>
                <Download className="mr-2 h-4 w-4" />
                Export Reports
              </Button>
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
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{pendingCount}</div>
                </CardContent>
              </Card>
              
              <Card className="border-critical/20 bg-critical/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-critical" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-critical">{criticalCount}</div>
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

            {/* Filters and Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <CardTitle>Reports List</CardTitle>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full sm:w-80"
                    />
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={severityFilter} onValueChange={handleSeverityFilter}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Attachments</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell className="font-mono text-sm">
                            {report._id}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div>
                              <p className="font-medium truncate">{report.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {report.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{report.operatorName || report.operatorId?.name}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.location}
                          </TableCell>
                          <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {report.createdAt}
                          </TableCell>
                          <TableCell>
                            {report.attachments && report.attachments.length > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {report.attachments.length} files
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReport(report._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Report Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Report ID</Label>
                  <p className="font-mono text-sm">{selectedReport._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedReport.severity)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <h3 className="text-lg font-semibold">{selectedReport.title}</h3>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedReport.location}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Operator</Label>
                    <p className="text-sm flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedReport.operatorName}
                    </p>
                  </div>
                </div>

                {selectedReport.relatedSensor && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Related Sensor</Label>
                    <p className="text-sm">{selectedReport.relatedSensor}</p>
                  </div>
                )}

                {selectedReport.adminNotes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Admin Notes</Label>
                    <p className="text-sm bg-blue-50 p-3 rounded-md border-l-4 border-blue-500">
                      {selectedReport.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update Section */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Update Status</Label>
                <div className="flex gap-2 mt-2">
                  {selectedReport.status === 'pending' && (
                    <Button
                      onClick={() => handleUpdateReportStatus(selectedReport._id, 'reviewed')}
                      disabled={updatingReport === selectedReport._id}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Mark as Reviewed
                    </Button>
                  )}
                  {(selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
                    <Button
                      onClick={() => handleUpdateReportStatus(selectedReport._id, 'resolved')}
                      disabled={updatingReport === selectedReport._id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Resolved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}