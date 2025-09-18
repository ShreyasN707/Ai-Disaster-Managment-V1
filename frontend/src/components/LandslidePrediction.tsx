import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useML } from '@/hooks/useML';
import { Upload, AlertTriangle, CheckCircle, XCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandslidePredictionProps {
  className?: string;
}

const LandslidePrediction: React.FC<LandslidePredictionProps> = ({ className }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    isLoading,
    error,
    lastPrediction,
    predictLandslide,
    clearError,
    clearPrediction,
  } = useML();

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    clearError();
    clearPrediction();

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup previous URL
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, clearError, clearPrediction]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handlePredict = async () => {
    if (!selectedFile) return;

    await predictLandslide(selectedFile);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    clearPrediction();
    clearError();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn('w-full max-w-4xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Landslide Risk Prediction
        </CardTitle>
        <CardDescription>
          Upload a satellite image to analyze landslide risk using AI-powered prediction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div className="space-y-4">
          <Label htmlFor="image-upload">Select Satellite Image</Label>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
              'hover:border-primary hover:bg-primary/5'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop your image here, or click to browse</p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, GIF up to 10MB
              </p>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              Browse Files
            </Button>
          </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && previewUrl && (
          <div className="space-y-4">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">Selected Image</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Selected satellite image"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>File: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handlePredict}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Analyze Image'
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <Label className="text-sm">Processing...</Label>
                    <Progress value={undefined} className="w-full" />
                    <p className="text-xs text-gray-500">
                      Analyzing satellite image for landslide risk patterns
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Prediction Results */}
        {lastPrediction && (
          <div className="space-y-4">
            <Separator />
            <div>
              <Label className="text-lg font-semibold">Prediction Results</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Assessment */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Level:</span>
                      <Badge
                        variant="outline"
                        className={cn('flex items-center gap-1', getRiskColor(lastPrediction.riskLevel))}
                      >
                        {getRiskIcon(lastPrediction.riskLevel)}
                        {lastPrediction.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Percentage:</span>
                      <span className="text-sm font-mono">{lastPrediction.riskPercentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing Time:</span>
                      <span className="text-sm font-mono">
                        {lastPrediction.metadata.processingTime}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Model Type:</span>
                      <span className="text-sm font-mono">{lastPrediction.metadata.modelType}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Mask Visualization */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Risk Mask</CardTitle>
                    <CardDescription>
                      Areas highlighted in white indicate potential landslide risk zones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={lastPrediction.maskImage}
                        alt="Landslide risk mask"
                        className="w-full h-48 object-cover bg-gray-100"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Mask dimensions: {lastPrediction.maskShape[0]} × {lastPrediction.maskShape[1]}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Interpretation Guide */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Risk Level Interpretation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <div>
                      <div className="font-medium">Low Risk</div>
                      <div className="text-gray-500">0-10%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500"></div>
                    <div>
                      <div className="font-medium">Medium Risk</div>
                      <div className="text-gray-500">10-20%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <div>
                      <div className="font-medium">High Risk</div>
                      <div className="text-gray-500">20-30%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <div>
                      <div className="font-medium">Critical Risk</div>
                      <div className="text-gray-500">30%+</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LandslidePrediction;
