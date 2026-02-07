import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  getAuthMode, 
  isDemoAuthAvailable, 
  isRealAuthAvailable, 
  getAvailableAuthOptions 
} from '../config/featureFlags';
import { backendAuthAPI, setAuthTokens, clearAuthTokens, getAccessToken, BackendAuthResponse } from '../services/backendAuthAPI';
import { storageService } from '../services/storageService';
import toast from 'react-hot-toast';

// Types for unified authentication
export interface UnifiedUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'seller' | 'buyer';
  user_type: 'admin' | 'seller' | 'buyer';
  is_verified: boolean;
  avatar_url?: string;
  created_at?: string;
  last_sign_in?: string;
  isDemo?: boolean;
}

interface UnifiedAuthState {
  user: UnifiedUser | null;
  loading: boolean;
  error: string | null;
  authMode: 'demo' | 'real' | null;
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null;
  loading: boolean;
  error: string | null;
  authMode: 'demo' | 'real' | null;
  login: (email: string, password: string, isDemo?: boolean) => Promise<boolean>;
  register: (userData: any, isDemo?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  switchToRealAuth: () => void;
  switchToDemoAuth: () => void;
  getAuthMode: () => 'demo' | 'real' | null;
  getUser: () => UnifiedUser | null;
  isAuthenticated: () => boolean;
  // AUTH_MODE methods
  getSystemAuthMode: () => 'demo' | 'real' | 'hybrid';
  getAvailableAuthOptions: () => ('demo' | 'real')[];
  isDemoAuthAvailable: () => boolean;
  isRealAuthAvailable: () => boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// Provider component
export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UnifiedAuthState>({
    user: null,
    loading: true,
    error: null,
    authMode: null,
  });

  // Initialize auth mode on mount
  useEffect(() => {
    console.log('🔐 UNIFIED AUTH: Initializing unified auth system');
    console.log('🔐 UNIFIED AUTH: System AUTH_MODE:', getAuthMode());
    
    // Get system auth mode
    const systemAuthMode = getAuthMode();
    console.log('🔐 UNIFIED AUTH: Available auth options:', getAvailableAuthOptions());
    
    // Check for backend auth tokens first (only if real auth is available)
    if (isRealAuthAvailable()) {
      const accessToken = getAccessToken();
      if (accessToken) {
        console.log('🔐 UNIFIED AUTH: Backend tokens found, setting auth mode to real');
        setState(prev => ({ ...prev, authMode: 'real', loading: false }));
        // Validate token by fetching user profile
        validateBackendToken();
        return;
      }
    }
    
    // Check for stored auth user (localStorage fallback)
    const storedUser = storageService.getAuthUser();
    if (storedUser) {
      console.log('🔐 UNIFIED AUTH: Stored user found, setting auth mode to real');
      setState(prev => ({ 
        ...prev, 
        user: storedUser, 
        authMode: 'real', 
        loading: false 
      }));
      return;
    }
    
    // Check for demo session (only if demo auth is available)
    if (isDemoAuthAvailable()) {
      const demoSession = storageService.getDemoSession();
      if (demoSession) {
        console.log('🔐 UNIFIED AUTH: Demo session found, setting auth mode to demo');
        // Extract user from demo session and convert to UnifiedUser format
        const demoUser = demoSession.user || demoSession;
        const unifiedUser: UnifiedUser = {
          id: demoUser.id || `demo_${Date.now()}`,
          email: demoUser.email,
          name: demoUser.user_metadata?.name || demoUser.name || 'Demo User',
          role: demoUser.user_metadata?.role || demoUser.role || 'buyer',
          user_type: demoUser.user_metadata?.user_type || demoUser.user_type || 'buyer',
          is_verified: true,
          avatar_url: demoUser.user_metadata?.avatar_url || demoUser.avatar_url,
          created_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString()
        };
        
        setState(prev => ({ 
          ...prev, 
          user: unifiedUser, 
          authMode: 'demo', 
          loading: false 
        }));
        return;
      }
    }
    
    // Check for existing session user (fallback) - REMOVED
    if (false) { // Disabled SessionContext dependency
      console.log('🔐 UNIFIED AUTH: Real user found, setting auth mode to real');
      setState(prev => ({ ...prev, authMode: 'real', loading: false }));
    } else {
      console.log('🔐 UNIFIED AUTH: No user found, auth mode null');
      setState(prev => ({ ...prev, authMode: null, loading: false }));
    }
  }, []);

  // Validate backend token and fetch user profile
  const validateBackendToken = useCallback(async () => {
    try {
      const user = await backendAuthAPI.getProfile();
      // Convert BackendUser to UnifiedUser format
      const unifiedUser: UnifiedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_type: user.role, // Map role to user_type
        is_verified: user.emailVerified, // Map emailVerified to is_verified
        avatar_url: user.profile?.avatarUrl,
        created_at: undefined,
        last_sign_in: undefined
      };
      setState(prev => ({ ...prev, user: unifiedUser }));
      console.log('🔐 UNIFIED AUTH: Backend token validated, user loaded:', user);
    } catch (error) {
      console.error('🔐 UNIFIED AUTH: Backend token validation failed:', error);
      // Clear invalid tokens
      clearAuthTokens();
      setState(prev => ({ ...prev, authMode: null, loading: false }));
    }
  }, []);

  // Unified login function - PRODUCTION PRIORITY
  const login = async (email: string, password: string, isDemo = false): Promise<boolean> => {
    console.log(`🔐 UNIFIED AUTH: ${isDemo ? 'Demo' : 'Real'} login attempt for:`, email);
    console.log('🔐 UNIFIED AUTH: System AUTH_MODE:', getAuthMode());
    
    // PRODUCTION: Force real authentication in production mode
    const isProduction = import.meta.env.PROD || import.meta.env.VITE_AUTH_MODE === 'real';
    if (isProduction && isDemo) {
      const error = 'Demo authentication disabled in production mode';
      console.error('🔐 UNIFIED AUTH:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      toast.error('Please use real authentication in production mode');
      return false;
    }
    
    // Check if requested auth type is available
    if (isDemo && !isDemoAuthAvailable()) {
      const error = 'Demo authentication not available';
      console.error('🔐 UNIFIED AUTH:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      toast.error(error);
      return false;
    }
    
    if (!isDemo && !isRealAuthAvailable()) {
      const error = 'Real authentication not available';
      console.error('🔐 UNIFIED AUTH:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      toast.error(error);
      return false;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (isDemo) {
        // Use demo login logic
        const demoUsers = [
          {
            email: 'buyer@demo.com',
            password: 'demo123',
            role: 'buyer' as const,
            user_type: 'buyer' as const,
            avatar_url: undefined
          },
          {
            email: 'seller@demo.com',
            password: 'demo123',
            role: 'seller' as const,
            user_type: 'seller' as const,
            avatar_url: undefined
          },
          {
            email: 'admin@demo.com',
            password: 'admin123',
            role: 'admin' as const,
            user_type: 'admin' as const,
            avatar_url: undefined
          }
        ];

        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        
        if (demoUser) {
          const demoSession = {
            user: {
              id: `demo_${Date.now()}`,
              email,
              name: 'Demo User',
              role: demoUser.role, 
              user_type: demoUser.user_type,
              avatar_url: demoUser.avatar_url
            }
          };

          localStorage.setItem('demo-session', JSON.stringify(demoSession));
          storageService.setDemoSession(demoSession);
          console.log('🔐 UNIFIED AUTH: Demo session created');
          
          setState({
            user: {
              id: `demo_${Date.now()}`,
              email,
              name: 'Demo User',
              role: 'buyer',
              user_type: 'buyer',
              is_verified: true,
              isDemo: true,
              avatar_url: undefined,
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString()
            },
            authMode: 'demo',
            loading: false,
            error: null
          });
          
          return true;
        } else {
          setState(prev => ({ ...prev, loading: false, error: 'Invalid demo credentials' }));
          return false;
        }
      } else {
        // Real auth logic - use backend API
        console.log('🔐 UNIFIED AUTH: Attempting real login via backend API');
        
        try {
          const authResponse: BackendAuthResponse = await backendAuthAPI.login({ email, password });
          
          // Store tokens
          setAuthTokens(authResponse.accessToken, authResponse.refreshToken);
          
          // Update state with user data
          setState({
            user: {
              id: authResponse.user.id,
              email: authResponse.user.email,
              name: authResponse.user.name,
              role: authResponse.user.role,
              user_type: authResponse.user.role, // Fixed: use role instead of user_type
              is_verified: authResponse.user.emailVerified, // Fixed: use emailVerified instead of is_verified
              avatar_url: authResponse.user.profile?.avatarUrl, // Fixed: use profile.avatarUrl instead of avatar_url
              created_at: undefined, // Fixed: remove non-existent field
              last_sign_in: undefined // Fixed: remove non-existent field
            },
            authMode: 'real',
            loading: false,
            error: null
          });
          
          return true;
        } catch (error: any) {
          console.error('🔐 UNIFIED AUTH: Real login failed:', error);
          
          let errorMessage = 'Login failed';
          if (error.response?.status === 401) {
            errorMessage = 'Invalid credentials';
          } else if (error.response?.status === 429) {
            errorMessage = 'Too many attempts. Please try again later.';
          } else if (error.code === 'NETWORK_ERROR') {
            errorMessage = 'Network error. Please check your connection.';
          }
          
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          toast.error(errorMessage);
          return false;
        }
      }
    } catch (error: any) {
      console.error('🔐 UNIFIED AUTH: Login error:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Login failed' }));
      return false;
    }
  };

  // Unified register function - PRODUCTION PRIORITY
  const register = async (userData: any, isDemo = false): Promise<boolean> => {
    console.log(`🔐 UNIFIED AUTH: ${isDemo ? 'Demo' : 'Real'} registration attempt for:`, userData.email);
    console.log('🔐 UNIFIED AUTH: System AUTH_MODE:', getAuthMode());
    
    // PRODUCTION: Force real authentication in production mode
    const isProduction = import.meta.env.PROD || import.meta.env.VITE_AUTH_MODE === 'real';
    if (isProduction && isDemo) {
      const error = 'Demo registration disabled in production mode';
      console.error('🔐 UNIFIED AUTH:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      toast.error('Please use real registration in production mode');
      return false;
    }
    
    // Check if requested auth type is available
    if (isDemo && !isDemoAuthAvailable()) {
      const error = 'Demo registration is not available in current mode';
      console.error('🔐 UNIFIED AUTH:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      toast.error(error);
      return false;
    }
    
    if (!isDemo && !isRealAuthAvailable()) {
      const error = 'Real registration is not available in current mode';
      console.error('🔐 UNIFIED AUTH:', error);
      setState(prev => ({ ...prev, loading: false, error }));
      toast.error(error);
      return false;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (isDemo) {
        // Demo registration - just create a session
        const demoSession = {
          user: {
            id: `demo_${Date.now()}`,
            email: userData.email,
            name: userData.name,
            role: userData.role || 'buyer',
            user_type: userData.user_type || 'buyer',
            avatar_url: userData.avatar_url
          }
        };

        localStorage.setItem('demo-session', JSON.stringify(demoSession));
        storageService.setDemoSession(demoSession);
        console.log('🔐 UNIFIED AUTH: Demo registration completed');
        
        setState({
          user: {
            id: `demo_${Date.now()}`,
            email: userData.email,
            name: userData.name,
            role: userData.role || 'buyer',
            user_type: userData.user_type || 'buyer',
            is_verified: true,
            isDemo: true,
            avatar_url: userData.avatar_url,
            created_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString()
          },
          authMode: 'demo',
          loading: false,
          error: null
        });
        
        return true;
      } else {
        // Real registration - use backend API
        console.log('🔐 UNIFIED AUTH: Attempting real registration via backend API');
        
        try {
          const authResponse: BackendAuthResponse = await backendAuthAPI.register(userData);
          
          // Store tokens
          setAuthTokens(authResponse.accessToken, authResponse.refreshToken);
          
          // Update state with user data
          setState({
            user: {
              id: authResponse.user.id,
              email: authResponse.user.email,
              name: authResponse.user.name,
              role: authResponse.user.role,
              user_type: authResponse.user.role,
              is_verified: authResponse.user.emailVerified,
              avatar_url: authResponse.user.profile?.avatarUrl,
              created_at: undefined,
              last_sign_in: undefined
            },
            authMode: 'real',
            loading: false,
            error: null
          });
          
          return true;
        } catch (error: any) {
          console.error('🔐 UNIFIED AUTH: Real registration failed:', error);
          
          let errorMessage = 'Registration failed';
          if (error.response?.status === 409) {
            errorMessage = 'Email already exists';
          } else if (error.response?.status === 429) {
            errorMessage = 'Too many attempts. Please try again later.';
          } else if (error.code === 'NETWORK_ERROR') {
            errorMessage = 'Network error. Please check your connection.';
          }
          
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          toast.error(errorMessage);
          return false;
        }
      }
    } catch (error: any) {
      console.error('🔐 UNIFIED AUTH: Registration error:', error);
      setState(prev => ({ ...prev, loading: false, error: 'Registration failed' }));
      return false;
    }
  };

  // Unified logout function
  const logout = async (): Promise<void> => {
    console.log('🔐 UNIFIED AUTH: Logging out user');
    
    // Clear tokens
    clearAuthTokens();
    
    // Clear demo session
    storageService.clearDemoSession();
    
    // Reset state
    setState({
      user: null,
      loading: false,
      error: null,
      authMode: null
    });
    
    toast.success('Logged out successfully');
  };

  // Switch to real auth
  const switchToRealAuth = useCallback(() => {
    console.log('🔐 UNIFIED AUTH: Switching to real authentication mode');
    setState(prev => ({ ...prev, authMode: 'real' }));
  }, []);

  // Switch to demo auth
  const switchToDemoAuth = useCallback(() => {
    console.log('🔐 UNIFIED AUTH: Switching to demo authentication mode');
    setState(prev => ({ ...prev, authMode: 'demo' }));
  }, []);

  // Get current auth mode
  const getAuthMode = (): 'demo' | 'real' | null => {
    return state.authMode;
  };

  // Get current user
  const getUser = (): UnifiedUser | null => {
    if (state.authMode === 'demo' && state.user && state.user.isDemo) {
      return state.user;
    }
    // Removed SessionContext dependency
    if (false) { // Disabled SessionContext dependency
      return null; // Fixed: removed sessionUser reference
    }
    return state.user;
  };

  const isAuthenticated = (): boolean => {
    return state.user !== null;
  };

  // AUTH_MODE methods - PRODUCTION PRIORITY
  const getSystemAuthMode = (): 'demo' | 'real' | 'hybrid' => {
    try {
      const mode = getAuthMode();
      return mode || 'real'; // Fallback to real for production
    } catch (error) {
      console.warn('Failed to get auth mode:', error);
      return 'real'; // Default to real for production
    }
  };

  const getAvailableAuthOptions = (): ('demo' | 'real')[] => {
    try {
      const options = getAvailableAuthOptions();
      // In production, prioritize real auth
      if (import.meta.env.PROD || import.meta.env.VITE_AUTH_MODE === 'real') {
        return options.filter(opt => opt === 'real');
      }
      return options;
    } catch (error) {
      console.warn('Failed to get available auth options:', error);
      return ['real']; // fallback to real only
    }
  };

  const value: UnifiedAuthContextType = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    authMode: state.authMode,
    login,
    register,
    logout,
    switchToRealAuth,
    switchToDemoAuth,
    getAuthMode,
    getUser,
    isAuthenticated,
    // AUTH_MODE methods
    getSystemAuthMode,
    getAvailableAuthOptions,
    isDemoAuthAvailable,
    isRealAuthAvailable,
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// Custom hook
export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthProvider;
