import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandslidePrediction from '@/components/LandslidePrediction';
import { useML } from '@/hooks/useML';
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Map,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MLDashboard: React.FC = () => {
  const {
    isLoading,
    error,
    mlStatus,
    riskPrediction,
    riskOverlay,
    checkMLStatus,
    getRiskPrediction,
    getRiskOverlay,
    clearError,
  } = useML();

  useEffect(() => {
    // Load initial data
    checkMLStatus();
    getRiskPrediction();
    getRiskOverlay();
  }, [checkMLStatus, getRiskPrediction, getRiskOverlay]);

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      checkMLStatus(),
      getRiskPrediction(),
      getRiskOverlay()
    ]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ML Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered disaster prediction and risk analysis
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Service</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusColor(mlStatus?.enabled || false)}>
                {getStatusIcon(mlStatus?.enabled || false)}
                {mlStatus?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Model: {mlStatus?.modelType || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusColor(mlStatus?.modelLoaded || false)}>
                {getStatusIcon(mlStatus?.modelLoaded || false)}
                {mlStatus?.modelLoaded ? 'Loaded' : 'Not Loaded'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskPrediction ? (
                <span className={getRiskColor(riskPrediction.level)}>
                  {riskPrediction.level.toUpperCase()}
                </span>
              ) : (
                <span className="text-gray-400">--</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Score: {riskPrediction?.score.toFixed(3) || '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Zones</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskOverlay?.features.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active monitoring zones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prediction">Landslide Prediction</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="settings">ML Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-4">
          <LandslidePrediction />
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Current Risk Assessment</CardTitle>
                <CardDescription>
                  Based on sensor data and environmental factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskPrediction ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={cn('text-4xl font-bold', getRiskColor(riskPrediction.level))}>
                        {riskPrediction.level.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Risk Score: {riskPrediction.score.toFixed(3)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Offline Sensors:</span>
                        <span>{riskPrediction.factors.offline}/{riskPrediction.factors.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Critical Health:</span>
                        <span>{riskPrediction.factors.critical}/{riskPrediction.factors.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Warning Status:</span>
                        <span>{riskPrediction.factors.warning}/{riskPrediction.factors.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>High Readings:</span>
                        <span>{riskPrediction.factors.recentHighReadings}/{riskPrediction.factors.total}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                    <p>No risk data available</p>
                    <Button variant="outline" className="mt-2" onClick={getRiskPrediction}>
                      Load Risk Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Overlay Info */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Overlay</CardTitle>
                <CardDescription>
                  Geographic risk zones and sensor coverage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskOverlay ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {riskOverlay.features.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Risk Zones Identified
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Zone Breakdown:</div>
                      {riskOverlay.features.map((feature, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{feature.properties.sensorName || `Zone ${index + 1}`}:</span>
                          <Badge variant="outline" className={cn('text-xs', getRiskColor(feature.properties.risk))}>
                            {feature.properties.risk}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Last updated: {riskOverlay.metadata.generated ? new Date(riskOverlay.metadata.generated).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Map className="mx-auto h-12 w-12 mb-4" />
                    <p>No overlay data available</p>
                    <Button variant="outline" className="mt-2" onClick={() => getRiskOverlay()}>
                      Load Overlay Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Live sensor data and automated risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Zap className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                <p className="mb-4">
                  This feature will display live sensor data, automated alerts, and continuous risk assessment.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ML Configuration</CardTitle>
              <CardDescription>
                Machine learning model settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Model Status</label>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(mlStatus?.enabled || false)}>
                        {mlStatus?.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model Type</label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {mlStatus?.modelType || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model Path</label>
                    <div className="mt-1 text-sm text-muted-foreground font-mono">
                      {mlStatus?.modelPath || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Updated</label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {mlStatus?.timestamp ? new Date(mlStatus.timestamp).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={checkMLStatus} disabled={isLoading}>
                    <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLDashboard;
