import { useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabaseClient';
import { useSession } from '../context/SessionContext';

interface UseSalesAuthResult {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null | undefined }>;
  logout: () => Promise<void>;
}

export const useSalesAuth = (): UseSalesAuthResult => {
  const { user, loading } = useSession();

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

  return {
    user,
    loading,
    login,
    logout,
  };
};
