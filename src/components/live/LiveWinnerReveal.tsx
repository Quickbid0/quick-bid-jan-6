import React from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabaseClient';
import Countdown from './Countdown';
import { useAuctionRevealFlow } from './useAuctionRevealFlow';
import { useAuctionVoice } from './useAuctionVoice';

interface LiveWinnerRevealProps {
  auctionId: string;
  itemTitle: string;
  itemImageUrl: string;
  open: boolean;
  onComplete?: () => void;
}

interface WinnerInfo {
  name: string;
  amount: number;
}

export const LiveWinnerReveal: React.FC<LiveWinnerRevealProps> = ({
  auctionId,
  itemTitle,
  itemImageUrl,
  open,
  onComplete,
}) => {
  const [winner, setWinner] = React.useState<WinnerInfo | null>(null);
  const { step, running, start } = useAuctionRevealFlow({ autoStart: false });
  const { speaking, announceCountdown, announceWinner, announceOutro } = useAuctionVoice();

  React.useEffect(() => {
    if (!open) return;

    const loadWinner = async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('amount, profiles!bids_user_id_fkey(full_name)')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading winner for reveal', error);
        return;
      }

      const row: any = data?.[0];
      if (!row) return;
      const name = row.profiles?.full_name || 'Winner';
      const amount = Number(row.amount) || 0;
      setWinner({ name, amount });
    };

    loadWinner();
  }, [auctionId, open]);

  React.useEffect(() => {
    if (!open) return;
    start();
  }, [open, start]);

  React.useEffect(() => {
    if (!open) return;

    let timeoutId: number | null = null;

    if (step === 0) {
      announceCountdown();
    }
    if (step === 3 && winner) {
      timeoutId = window.setTimeout(() => {
        announceWinner(winner.name, winner.amount);
      }, 300);
    }
    if (step === 5) {
      announceOutro();
      if (onComplete) {
        onComplete();
      }
    }

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [step, open, winner, announceCountdown, announceWinner, announceOutro, onComplete]);

  if (!open) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative flex max-w-xl flex-col items-center justify-center px-4 text-center">
        {step === 0 && <Countdown seconds={5} />}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400"
          >
            🎉 Winner!
          </motion.div>
        )}

        {step >= 2 && winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{winner.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Winning bid: ₹{winner.amount.toLocaleString()}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveWinnerReveal;
