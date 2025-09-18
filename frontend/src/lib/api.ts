// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface MLStatus {
  enabled: boolean;
  modelLoaded: boolean;
  modelType: 'mock' | 'disabled' | 'tensorflow';
  modelPath: string;
  timestamp: string;
}

export interface LandslidePredict {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskPercentage: string;
  maskShape: [number, number];
  maskImage: string; // base64 encoded image
  metadata: {
    modelType: string;
    processingTime: number;
    originalFilename: string;
    fileSize: number;
  };
}

export interface RiskPrediction {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: {
    offline: number;
    critical: number;
    warning: number;
    total: number;
    recentHighReadings: number;
  };
}

export interface RiskOverlay {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      risk: string;
      sensorId?: string;
      sensorName?: string;
      status?: string;
      health?: string;
      demo?: boolean;
    };
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  }>;
  metadata: {
    generated: string;
    sensorCount: number;
    bounds?: any;
  };
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'public';
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Create headers with auth token
const createHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Create headers for file uploads
const createFileHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {};

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...createHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, role: string, adminCode?: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    return apiRequest('/auth/register', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email, password, role, adminRegistrationCode: adminCode }),
    });
  },

  me: async (): Promise<ApiResponse<User>> => {
    return apiRequest('/auth/me');
  },
};

// ML API
export const mlApi = {
  getStatus: async (): Promise<ApiResponse<MLStatus>> => {
    return apiRequest('/ml/status', {
      headers: createHeaders(false),
    });
  },

  predictLandslide: async (imageFile: File): Promise<ApiResponse<LandslidePredict>> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/ml/predict/landslide/json`, {
      method: 'POST',
      headers: createFileHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getRiskPrediction: async (): Promise<ApiResponse<RiskPrediction>> => {
    return apiRequest('/ml/risk/prediction');
  },

  getRiskOverlay: async (bounds?: any): Promise<ApiResponse<RiskOverlay>> => {
    const params = bounds ? `?bounds=${JSON.stringify(bounds)}` : '';
    return apiRequest(`/ml/risk/overlay${params}`);
  },
};

// Public API
export const publicApi = {
  getAlerts: async (): Promise<ApiResponse<Alert[]>> => {
    return apiRequest('/public/alerts', {
      headers: createHeaders(false),
    });
  },

  getInfo: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/public/info', {
      headers: createHeaders(false),
    });
  },

  subscribe: async (email: string): Promise<ApiResponse<any>> => {
    return apiRequest('/public/subscribe', {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email }),
    });
  },
};

// Admin API
export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/admin/dashboard');
  },

  createAlert: async (alertData: Partial<Alert>): Promise<ApiResponse<Alert>> => {
    return apiRequest('/admin/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  updateAlert: async (id: string, alertData: Partial<Alert>): Promise<ApiResponse<Alert>> => {
    return apiRequest(`/admin/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    });
  },

  getReports: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/admin/reports');
  },

  exportReports: async (format: 'pdf' | 'excel'): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/export?format=${format}`, {
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  },
};

// Operator API
export const operatorApi = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/operator/dashboard');
  },

  acknowledgeAlert: async (alertId: string): Promise<ApiResponse<any>> => {
    return apiRequest('/operator/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ alertId }),
    });
  },

  createSensor: async (sensorData: any): Promise<ApiResponse<any>> => {
    return apiRequest('/operator/sensors', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  },

  updateSensor: async (id: string, sensorData: any): Promise<ApiResponse<any>> => {
    return apiRequest(`/operator/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sensorData),
    });
  },

  createIncident: async (incidentData: FormData): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/operator/incidents`, {
      method: 'POST',
      headers: createFileHeaders(),
      body: incidentData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; env: string }> => {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  return response.json();
};

export default {
  authApi,
  mlApi,
  publicApi,
  adminApi,
  operatorApi,
  healthCheck,
};
