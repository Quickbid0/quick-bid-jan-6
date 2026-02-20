import api from '../services/api';
import { useWalletStore } from '../stores/walletStore';

/**
 * FIX F-07, ST-01: Wallet Balance State Sync
 * After "Add Money" succeeds, wallet balance updates immediately WITHOUT page reload
 */

export const useAddMoney = () => {
  const { balance, updateBalance, setBalance, setError } = useWalletStore(
    (state) => ({
      balance: state.balance,
      updateBalance: state.updateBalance,
      setBalance: state.setBalance,
      setError: state.setError,
    })
  );

  const addMoney = async (amount: number) => {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return { success: false, error: 'Amount must be greater than 0' };
    }

    try {
      // Make API request to add money
      const response = await api.post('/api/wallet/topup', { amount });

      if (response.data.success) {
        // ✅ FIX F-07: Update store IMMEDIATELY — don't wait for re-fetch
        updateBalance(amount);
        setError(null);

        // Optionally re-fetch for server confirmation
        try {
          const balanceResponse = await api.get('/api/wallet/balance');
          if (balanceResponse.data.balance !== undefined) {
            setBalance(balanceResponse.data.balance);
          }
        } catch (err) {
          console.warn('Failed to sync wallet balance:', err);
        }

        return {
          success: true,
          newBalance: balance + amount,
          message: `Successfully added ₹${amount} to your wallet!`,
        };
      } else {
        setError(response.data.error || 'Failed to add money');
        return { success: false, error: response.data.error };
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add money to wallet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get('/api/wallet/balance');
      if (response.data.balance !== undefined) {
        setBalance(response.data.balance);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err);
      setError('Failed to fetch wallet balance');
    }
  };

  return { addMoney, fetchWalletBalance, balance };
};
