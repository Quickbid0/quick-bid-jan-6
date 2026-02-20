import { create } from 'zustand';
import { QueryClient } from '@tanstack/react-query';

interface User {
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

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: (queryClient?: QueryClient) => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,
  login: (user) => set({ user, isAuthenticated: true, loading: false }),
  
  /**
   * FIX ST-02: Post-Logout State Leak
   * Reset ENTIRE store to initial state to prevent browser back button from showing authenticated content
   */
  logout: async (queryClient?: QueryClient) => {
    try {
      // Call backend logout to clear httpOnly cookies
      const backendAuthAPI = (await import('../services/backendAuthAPI')).default;
      await backendAuthAPI.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    }

    // Clear React Query cache to prevent showing stale data
    if (queryClient) {
      queryClient.clear();
    }

    // Reset ENTIRE store to initial state
    set(initialState);

    // Clear localStorage of auth-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Navigate with history replacement so back button doesn't return to protected page
    window.location.href = '/login';
  },

  setLoading: (loading) => set({ loading }),
  updateUser: (user) => set({ user }),
}));
