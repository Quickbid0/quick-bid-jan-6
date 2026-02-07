import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { storageService } from '../services/storageService';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'buyer' | 'seller' | 'admin' | 'superadmin';
  avatar_url?: string;
  kyc_status?: 'pending' | 'verified' | 'rejected';
  wallet_balance?: number;
  is_verified?: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }

        setLoading(false);
      }
    );

    // Listen for demo login events
    const handleDemoLogin = (event: any) => {
      console.log('Demo login event received:', event.detail);
      const demoSession = event.detail;
      if (demoSession && demoSession.user) {
        setUser({
          id: demoSession.user.id || 'demo-user',
          email: demoSession.user.email || 'demo@example.com',
          name: demoSession.user.user_metadata?.name || 'Demo User',
          role: demoSession.user.user_metadata?.user_type || 'buyer',
          avatar_url: demoSession.user.user_metadata?.avatar_url,
          kyc_status: 'verified',
          wallet_balance: 50000,
          is_verified: true,
          created_at: new Date().toISOString()
        });
        setLoading(false);
      }
    };

    window.addEventListener('demo-login', handleDemoLogin);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('demo-login', handleDemoLogin);
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error checking auth session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        // Check for demo session using storageService
        const demoSession = storageService.getDemoSession();
        if (demoSession) {
          setUser({
            id: demoSession.user?.id || 'demo-user',
            email: demoSession.user?.email || 'demo@example.com',
            name: demoSession.user?.user_metadata?.name || 'Demo User',
            role: demoSession.user?.user_metadata?.user_type || 'buyer',
            avatar_url: demoSession.user?.user_metadata?.avatar_url,
            kyc_status: 'verified',
            wallet_balance: 50000,
            is_verified: true,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error in checkUser:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Load user profile from backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setUser({
          id: userId,
          email: profileData.email,
          name: profileData.name || profileData.full_name,
          role: profileData.role || 'buyer',
          avatar_url: profileData.avatar_url,
          kyc_status: profileData.kyc_status,
          wallet_balance: profileData.wallet_balance,
          is_verified: profileData.is_verified,
          created_at: profileData.created_at
        });
      } else {
        // Fallback to Supabase user data
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        if (supabaseUser) {
          setUser({
            id: userId,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
            role: (supabaseUser.app_metadata?.role || supabaseUser.user_metadata?.role || 'buyer') as any,
            avatar_url: supabaseUser.user_metadata?.avatar_url,
            kyc_status: 'pending',
            wallet_balance: 0,
            is_verified: false,
            created_at: supabaseUser.created_at
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to basic user data
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        setUser({
          id: userId,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || '',
          role: 'buyer',
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          kyc_status: 'pending',
          wallet_balance: 0,
          is_verified: false,
          created_at: supabaseUser.created_at
        });
      }
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Try backend authentication first
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (backendResponse.ok) {
        const { accessToken, refreshToken, user: userData } = await backendResponse.json();

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Set user data
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || userData.full_name,
          role: userData.role || 'buyer',
          avatar_url: userData.avatar_url,
          kyc_status: userData.kyc_status,
          wallet_balance: userData.wallet_balance,
          is_verified: userData.is_verified,
          created_at: userData.created_at
        });

        toast.success('Successfully signed in!');
        return { success: true };
      }

      // Fallback to Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Store access token for API calls
        if (data.session?.access_token) {
          localStorage.setItem('accessToken', data.session.access_token);
        }

        await loadUserProfile(data.user.id);
        toast.success('Successfully signed in!');
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };

    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Try backend registration first
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: userData.name,
          role: userData.role || 'buyer',
          phone: userData.phone,
        }),
      });

      if (backendResponse.ok) {
        const { accessToken, refreshToken, user: newUser } = await backendResponse.json();

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Set user data
        setUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role || 'buyer',
          kyc_status: 'pending',
          wallet_balance: 0,
          is_verified: false,
          created_at: newUser.created_at
        });

        toast.success('Account created successfully!');
        return { success: true };
      }

      // Fallback to Supabase registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'buyer',
            phone: userData.phone,
          },
        },
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email for verification.');
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };

    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Clear demo session using storageService
      storageService.clearDemoSession();

      // Try backend logout
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } catch (error) {
        console.log('Backend logout failed, continuing with client logout');
      }

      // Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }

      setUser(null);
      toast.success('Successfully signed out!');

    } catch (error) {
      console.error('Sign out error:', error);
      // Clear user data anyway
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      // Try backend profile update
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });

      if (backendResponse.ok) {
        const updatedUser = await backendResponse.json();
        setUser(prev => prev ? { ...prev, ...updatedUser } : null);
        toast.success('Profile updated successfully!');
        return { success: true };
      }

      // Fallback to Supabase profile update
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully!');
      return { success: true };

    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
