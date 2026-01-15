import { useCallback, useEffect, useState } from 'react';
import { announceBid, announceCountdown, announceOutro, announceStart, announceWinner } from './AnchorVoice';

export const useAuctionVoice = () => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const handleStart = () => setSpeaking(true);
    const handleEnd = () => setSpeaking(false);

    window.speechSynthesis.addEventListener('voiceschanged', () => {});

    return () => {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, []);

  const withFlag = useCallback(async (fn: () => Promise<void>) => {
    try {
      setSpeaking(true);
      await fn();
    } finally {
      setSpeaking(false);
    }
  }, []);

  return {
    speaking,
    announceBid: (userName: string, amount: number) => withFlag(() => announceBid(userName, amount)),
    announceStart: (itemName: string) => withFlag(() => announceStart(itemName)),
    announceCountdown: () => withFlag(() => announceCountdown()),
    announceWinner: (name: string, amount: number) => withFlag(() => announceWinner(name, amount)),
    announceOutro: () => withFlag(() => announceOutro()),
  };
};

export default useAuctionVoice;
