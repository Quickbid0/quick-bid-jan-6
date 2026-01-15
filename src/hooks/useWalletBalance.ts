import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const useWalletBalance = (userId, refreshTrigger = 0) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!userId) {
        setLoading(false);
        setError('User ID is required');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (error && error.message.includes('no rows')) {
          const { error: createError } = await supabase
            .from('wallets')
            .insert([{ user_id: userId, balance: 0 }]);

          if (createError) {
            throw createError;
          }

          setBalance(0);
        } else if (data) {
          setBalance(data.balance);
        } else if (error) {
          throw error;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error fetching wallet';
        setError(message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [userId, refreshTrigger]);

  return { balance, loading, error };
};

export default useWalletBalance;
