import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, AlertCircle } from "lucide-react";

interface RiskLevelWidgetProps {
  level: "safe" | "low" | "moderate" | "warning" | "high" | "critical";
  description?: string;
  lastUpdated?: string;
}

export function RiskLevelWidget({ 
  level, 
  description = "Exercise caution. Potential hazards detected in some regions. Stay updated with alerts.",
  lastUpdated = "2 minutes ago"
}: RiskLevelWidgetProps) {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "critical":
        return {
          variant: "critical" as const,
          icon: AlertTriangle,
          label: "Critical",
          bgClass: "bg-critical/10 border-critical/20",
        };
      case "high":
        return {
          variant: "high" as const,
          icon: AlertTriangle,
          label: "High",
          bgClass: "bg-high/10 border-high/20",
        };
      case "warning":
        return {
          variant: "warning" as const,
          icon: AlertCircle,
          label: "Warning",
          bgClass: "bg-warning/10 border-warning/20",
        };
      case "moderate":
        return {
          variant: "moderate" as const,
          icon: AlertCircle,
          label: "Moderate",
          bgClass: "bg-moderate/10 border-moderate/20",
        };
      case "low":
        return {
          variant: "low" as const,
          icon: Shield,
          label: "Low",
          bgClass: "bg-low/10 border-low/20",
        };
      default:
        return {
          variant: "safe" as const,
          icon: Shield,
          label: "Safe",
          bgClass: "bg-safe/10 border-safe/20",
        };
    }
  };

  const config = getRiskConfig(level);
  const Icon = config.icon;

  return (
    <Card className={`${config.bgClass} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">Current Risk Level</span>
          <Icon className="h-6 w-6 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Badge variant={config.variant} className="text-lg px-4 py-2">
              {config.label}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}