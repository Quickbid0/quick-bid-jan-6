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
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    loading,
    login,
    logout,
  };
};
