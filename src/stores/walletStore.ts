import { create } from 'zustand';

interface WalletStore {
  balance: number;
  isLoading: boolean;
  error: string | null;
  
  // FIX F-07: Wallet Balance State Sync
  // Update balance immediately after add money succeeds (optimistic update)
  setBalance: (amount: number) => void;
  updateBalance: (amount: number) => void; // increment/decrement
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  balance: 0,
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletStore>((set) => ({
  ...initialState,
  
  setBalance: (amount) => set({ balance: amount, error: null }),
  
  /**
   * Optimistic update: increment balance immediately when add money succeeds
   * Frontend: await api.post('/wallet/topup', {amount});
   *           useWalletStore.getState().updateBalance(amount); // ✅ This line!
   * Then optionally re-fetch to confirm server-side balance
   */
  updateBalance: (amount) =>
    set((state) => ({
      balance: Math.max(0, state.balance + amount),
      error: null,
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
