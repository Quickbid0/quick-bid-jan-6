import { create } from 'zustand';

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
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: (user) => set({ user, isAuthenticated: true, loading: false }),
  logout: () => set({ user: null, isAuthenticated: false, loading: false }),
  setLoading: (loading) => set({ loading }),
  updateUser: (user) => set({ user }),
}));
