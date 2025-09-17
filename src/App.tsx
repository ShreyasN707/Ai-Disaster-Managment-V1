import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Info from "./pages/Info";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSensors from "./pages/admin/AdminSensors";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import OperatorSensors from "./pages/operator/OperatorSensors";
import OperatorReports from "./pages/operator/OperatorReports";
import OperatorAlerts from "./pages/operator/OperatorAlerts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<Info />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sensors" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSensors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Operator Routes */}
            <Route 
              path="/operator" 
              element={
                <ProtectedRoute requiredRole="operator">
                  <OperatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operator/sensors" 
              element={
                <ProtectedRoute requiredRole="operator">
                  <OperatorSensors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operator/reports" 
              element={
                <ProtectedRoute requiredRole="operator">
                  <OperatorReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operator/alerts" 
              element={
                <ProtectedRoute requiredRole="operator">
                  <OperatorAlerts />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
