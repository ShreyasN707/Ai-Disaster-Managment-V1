import { useState, useCallback } from 'react';
import { mlApi, type LandslidePredict, type RiskPrediction, type RiskOverlay, type MLStatus } from '@/lib/api';
import { toast } from 'sonner';

interface UseMLReturn {
  // State
  isLoading: boolean;
  error: string | null;
  mlStatus: MLStatus | null;
  lastPrediction: LandslidePredict | null;
  riskPrediction: RiskPrediction | null;
  riskOverlay: RiskOverlay | null;

  // Actions
  checkMLStatus: () => Promise<void>;
  predictLandslide: (imageFile: File) => Promise<LandslidePredict | null>;
  getRiskPrediction: () => Promise<RiskPrediction | null>;
  getRiskOverlay: (bounds?: any) => Promise<RiskOverlay | null>;
  clearError: () => void;
  clearPrediction: () => void;
}

export const useML = (): UseMLReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mlStatus, setMLStatus] = useState<MLStatus | null>(null);
  const [lastPrediction, setLastPrediction] = useState<LandslidePredict | null>(null);
  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
  const [riskOverlay, setRiskOverlay] = useState<RiskOverlay | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPrediction = useCallback(() => {
    setLastPrediction(null);
    setError(null);
  }, []);

  const checkMLStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await mlApi.getStatus();
      
      if (response.success && response.data) {
        setMLStatus(response.data);
      } else {
        throw new Error(response.message || 'Failed to get ML status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check ML status';
      setError(errorMessage);
      console.error('ML status check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictLandslide = useCallback(async (imageFile: File): Promise<LandslidePredict | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate file
      if (!imageFile) {
        throw new Error('No image file provided');
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      if (imageFile.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Image file is too large. Maximum size is 10MB');
      }

      toast.info('Processing landslide prediction...', {
        description: 'This may take a few moments'
      });

      const response = await mlApi.predictLandslide(imageFile);
      
      if (response.success && response.data) {
        setLastPrediction(response.data);
        
        toast.success('Landslide prediction completed', {
          description: `Risk level: ${response.data.riskLevel} (${response.data.riskPercentage}%)`
        });

        return response.data;
      } else {
        throw new Error(response.message || 'Prediction failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Landslide prediction failed';
      setError(errorMessage);
      
      toast.error('Prediction failed', {
        description: errorMessage
      });

      console.error('Landslide prediction failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRiskPrediction = useCallback(async (): Promise<RiskPrediction | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await mlApi.getRiskPrediction();
      
      if (response.success && response.data) {
        setRiskPrediction(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get risk prediction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get risk prediction';
      setError(errorMessage);
      console.error('Risk prediction failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRiskOverlay = useCallback(async (bounds?: any): Promise<RiskOverlay | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await mlApi.getRiskOverlay(bounds);
      
      if (response.success && response.data) {
        setRiskOverlay(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get risk overlay');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get risk overlay';
      setError(errorMessage);
      console.error('Risk overlay failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    mlStatus,
    lastPrediction,
    riskPrediction,
    riskOverlay,

    // Actions
    checkMLStatus,
    predictLandslide,
    getRiskPrediction,
    getRiskOverlay,
    clearError,
    clearPrediction,
  };
};

export default useML;
