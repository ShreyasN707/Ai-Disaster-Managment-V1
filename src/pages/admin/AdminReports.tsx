import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/shared/SearchBar";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved';
  location: string;
  operatorName: string;
  createdAt: string;
  attachments?: number;
}

const mockReports: Report[] = [
  {
    id: 'INC001',
    title: 'Sensor malfunction at river monitoring station',
    description: 'Water level sensor showing inconsistent readings',
    severity: 'high',
    status: 'pending',
    location: 'Riverfront District, Sector C',
    operatorName: 'John Operator',
    createdAt: '2024-01-15 14:30',
    attachments: 3
  },
  {
    id: 'INC002',
    title: 'Infrastructure damage report',
    description: 'Bridge structural integrity compromised',
    severity: 'critical',
    status: 'reviewed',
    location: 'Bridge 42, Central Artery',
    operatorName: 'Sarah Field',
    createdAt: '2024-01-15 09:15',
    attachments: 5
  },
  {
    id: 'INC003',
    title: 'Routine maintenance completed',
    description: 'Regular sensor calibration and cleaning',
    severity: 'low',
    status: 'resolved',
    location: 'Industrial Zone North',
    operatorName: 'Mike Tech',
    createdAt: '2024-01-14 16:45',
    attachments: 1
  }
];

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [filteredReports, setFilteredReports] = useState<Report[]>(mockReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const { toast } = useToast();

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
    toast({
      title: "View Report",
      description: `Opening detailed view for report ${reportId}`,
    });
  };

  const handleExportReports = () => {
    toast({
      title: "Export Started",
      description: "Reports are being exported to PDF. You'll be notified when ready.",
    });
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
                    <SearchBar
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={handleSearch}
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
                        <TableRow key={report.id}>
                          <TableCell className="font-mono text-sm">
                            {report.id}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div>
                              <p className="font-medium truncate">{report.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {report.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{report.operatorName}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.location}
                          </TableCell>
                          <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {report.createdAt}
                          </TableCell>
                          <TableCell>
                            {report.attachments && (
                              <span className="text-sm text-muted-foreground">
                                {report.attachments} files
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReport(report.id)}
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
    </SidebarProvider>
  );
}