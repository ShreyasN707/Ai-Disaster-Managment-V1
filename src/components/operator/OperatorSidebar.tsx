import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  AlertTriangle,
  LogOut 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const operatorItems = [
  { title: "Dashboard", url: "/operator", icon: LayoutDashboard },
  { title: "Sensors", url: "/operator/sensors", icon: Activity },
  { title: "Incident Reports", url: "/operator/reports", icon: FileText },
  { title: "Alerts", url: "/operator/alerts", icon: AlertTriangle },
];

export function OperatorSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/operator") {
      return currentPath === "/operator";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operator Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operatorItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className={`p-2 ${state === "collapsed" ? 'text-center' : ''}`}>
          {state !== "collapsed" && (
            <div className="mb-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
          <Button
            onClick={logout}
            variant="outline"
            size={state === "collapsed" ? "icon" : "sm"}
            className="w-full"
          >
            <LogOut className="h-4 w-4" />
            {state !== "collapsed" && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}