import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'seller' | 'buyer'; // ONLY 3 VALID ROLES
  user_type: 'buyer' | 'seller' | 'admin';
  is_verified: boolean;
  avatar_url?: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, userType: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        console.log('🔐 AUTH: Session check initiated');
        
        // First check for demo session - SINGLE SOURCE OF TRUTH
        const demoSession = localStorage.getItem('demo-session');
        if (demoSession) {
          console.log('🔐 AUTH: Demo session found, restoring user state');
          const session = JSON.parse(demoSession);
          
          // Validate role is one of the 3 allowed roles
          const userRole = session.user.user_metadata.role;
          const validRoles = ['admin', 'seller', 'buyer'];
          
          if (!validRoles.includes(userRole)) {
            console.error('🔐 AUTH: Invalid role detected in demo session:', userRole);
            localStorage.removeItem('demo-session');
            setUser(null);
            setLoading(false);
            return;
          }
          
          console.log('🔐 AUTH: Demo session validated, role:', userRole);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.name,
            role: userRole as 'admin' | 'seller' | 'buyer',
            user_type: session.user.user_metadata.user_type as 'admin' | 'seller' | 'buyer',
            is_verified: true, // Demo users are always verified
            avatar_url: session.user.user_metadata.avatar_url,
          });
          setLoading(false);
          return;
        }

        // Check for real Supabase session
        console.log('🔐 AUTH: No demo session, checking Supabase session');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('🔐 AUTH: Supabase session found, fetching profile');
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            // Validate role
            const userRole = profile.role || 'buyer';
            const validRoles = ['admin', 'seller', 'buyer'];
            
            if (!validRoles.includes(userRole)) {
              console.error('🔐 AUTH: Invalid role in profile:', userRole);
              // Default to buyer for invalid roles
              profile.role = 'buyer';
              profile.user_type = 'buyer';
            }
            
            console.log('🔐 AUTH: Profile loaded, role:', profile.role);
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
              role: profile.role,
              user_type: profile.user_type,
              is_verified: profile.is_verified || false,
              avatar_url: profile.avatar_url,
            });
          }
        } else {
          console.log('🔐 AUTH: No session found');
        }
      } catch (error) {
        console.error('🔐 AUTH: Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for demo login events
    const handleDemoLogin = (event: any) => {
      console.log('🔐 AUTH: Demo login event received');
      const session = event.detail;
      
      // Validate role
      const userRole = session.user.user_metadata.role;
      const validRoles = ['admin', 'seller', 'buyer'];
      
      if (!validRoles.includes(userRole)) {
        console.error('🔐 AUTH: Invalid role in demo login event:', userRole);
        return;
      }
      
      console.log('🔐 AUTH: Demo login validated, setting user state, role:', userRole);
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata.name,
        role: userRole as 'admin' | 'seller' | 'buyer',
        user_type: session.user.user_metadata.user_type as 'admin' | 'seller' | 'buyer',
        is_verified: true,
        avatar_url: session.user.user_metadata.avatar_url,
      });
    };

    window.addEventListener('demo-login', handleDemoLogin);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 AUTH: Supabase auth state change:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔐 AUTH: User signed in, fetching profile');
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            // Validate role
            const userRole = profile.role || 'buyer';
            const validRoles = ['admin', 'seller', 'buyer'];
            
            if (!validRoles.includes(userRole)) {
              console.error('🔐 AUTH: Invalid role in auth change:', userRole);
              profile.role = 'buyer';
              profile.user_type = 'buyer';
            }
            
            console.log('🔐 AUTH: Auth change profile loaded, role:', profile.role);
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
              role: profile.role,
              user_type: profile.user_type,
              is_verified: profile.is_verified || false,
              avatar_url: profile.avatar_url,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 AUTH: User signed out, clearing session');
          setUser(null);
          // Clear ALL demo-related storage
          localStorage.removeItem('demo-session');
          localStorage.removeItem('demo-user-role');
          localStorage.removeItem('demo-user-type');
          localStorage.removeItem('demo-user-name');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('demo-login', handleDemoLogin);
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔐 AUTH: Logout initiated');
      
      // Clear backend auth tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Call backend logout API
      try {
        const response = await fetch('http://localhost:4011/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          console.log('✅ Backend logout successful');
        } else {
          console.log('⚠️ Backend logout failed, but continuing with client-side logout');
        }
      } catch (error) {
        console.log('⚠️ Backend logout error, but continuing with client-side logout:', error);
      }
      
      setUser(null);
      // Clear ALL demo-related storage
      localStorage.removeItem('demo-session');
      localStorage.removeItem('demo-user-role');
      localStorage.removeItem('demo-user-type');
      localStorage.removeItem('demo-user-name');
      console.log('🔐 AUTH: All storage cleared, user logged out');
    } catch (error) {
      console.error('🔐 AUTH: Logout error:', error);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    userType: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate userType - only allow 3 valid roles
      const validUserTypes = ['buyer', 'seller', 'admin'];
      const normalizedUserType = userType.toLowerCase();
      
      if (!validUserTypes.includes(normalizedUserType)) {
        return { success: false, error: 'Invalid user type. Must be buyer, seller, or admin.' };
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            user_type: normalizedUserType,
            role: normalizedUserType, // Use same as user_type
            is_verified: false,
          });

        if (profileError) {
          return { success: false, error: 'Failed to create profile' };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          avatar_url: data.avatar_url,
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const value: SessionContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
