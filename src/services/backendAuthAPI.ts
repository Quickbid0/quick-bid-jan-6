import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Backend API configuration
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4011';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await refreshAccessToken(refreshToken);
          const { accessToken } = response;
          
          localStorage.setItem('access_token', accessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearAuthTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Types for backend API responses
export interface BackendAuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'seller' | 'buyer';
    emailVerified: boolean;
    profile?: {
      avatarUrl?: string;
      bio?: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}

export interface BackendUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'seller' | 'buyer';
  emailVerified: boolean;
  profile?: {
    avatarUrl?: string;
    bio?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'seller' | 'buyer';
}

// Token management utilities
export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearAuthTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// Backend API functions
export const backendAuthAPI = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<BackendAuthResponse> => {
    console.log('🔐 BACKEND API: Attempting login for:', credentials.email);
    
    try {
      const response: AxiosResponse<BackendAuthResponse> = await apiClient.post('/api/auth/login', credentials);
      console.log('🔐 BACKEND API: Login successful');
      return response.data;
    } catch (error) {
      console.error('🔐 BACKEND API: Login failed:', error);
      throw error;
    }
  },

  // Register user
  register: async (userData: RegisterData): Promise<BackendAuthResponse> => {
    console.log('🔐 BACKEND API: Attempting registration for:', userData.email);
    
    try {
      const response: AxiosResponse<BackendAuthResponse> = await apiClient.post('/api/auth/register', userData);
      console.log('🔐 BACKEND API: Registration successful');
      return response.data;
    } catch (error) {
      console.error('🔐 BACKEND API: Registration failed:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async (): Promise<BackendUser> => {
    console.log('🔐 BACKEND API: Getting user profile');
    
    try {
      const response: AxiosResponse<BackendUser> = await apiClient.get('/api/auth/me');
      console.log('🔐 BACKEND API: Profile retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('🔐 BACKEND API: Profile retrieval failed:', error);
      throw error;
    }
  },

  // Refresh access token
  refreshAccessToken: async (refreshToken: string): Promise<BackendAuthResponse> => {
    console.log('🔐 BACKEND API: Refreshing access token');
    
    try {
      const response: AxiosResponse<BackendAuthResponse> = await apiClient.post('/api/auth/refresh', {
        refreshToken
      });
      console.log('🔐 BACKEND API: Token refresh successful');
      return response.data;
    } catch (error) {
      console.error('🔐 BACKEND API: Token refresh failed:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    console.log('🔐 BACKEND API: Logging out user');
    
    try {
      await apiClient.post('/api/auth/logout');
      console.log('🔐 BACKEND API: Logout successful');
    } catch (error) {
      console.error('🔐 BACKEND API: Logout failed:', error);
      // Still clear tokens even if backend call fails
    } finally {
      clearAuthTokens();
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    console.log('🔐 BACKEND API: Requesting password reset for:', email);
    
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      console.log('🔐 BACKEND API: Password reset request sent');
    } catch (error) {
      console.error('🔐 BACKEND API: Password reset request failed:', error);
      // Always return success to prevent user enumeration
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<void> => {
    console.log('🔐 BACKEND API: Resetting password');
    
    try {
      await apiClient.post('/api/auth/reset-password', { token, password });
      console.log('🔐 BACKEND API: Password reset successful');
    } catch (error) {
      console.error('🔐 BACKEND API: Password reset failed:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    console.log('🔐 BACKEND API: Verifying email');
    
    try {
      await apiClient.get('/api/auth/verify-email', { params: { token } });
      console.log('🔐 BACKEND API: Email verification successful');
    } catch (error) {
      console.error('🔐 BACKEND API: Email verification failed:', error);
      throw error;
    }
  },
};

// Export the refresh function for interceptor
export const refreshAccessToken = backendAuthAPI.refreshAccessToken;

// Health check for backend
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/api/health');
    return true;
  } catch (error) {
    console.error('🔐 BACKEND API: Health check failed:', error);
    return false;
  }
};

export default backendAuthAPI;
