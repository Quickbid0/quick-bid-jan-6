import { useEffect, useState } from 'react';

export type RevealStep = 0 | 1 | 2 | 3 | 4 | 5;

// Step durations (ms):
// 0: Countdown – 5s
// 1: Flash – 0.6s
// 2: Confetti burst – 1.4s
// 3: Winner card + trophy reveal – 2.2s
// 4: Confetti slow drift – 3s
// 5: Outro text – 0.8s
const TIMERS = [5000, 600, 1400, 2200, 3000, 800] as const;

interface UseAuctionRevealFlowOptions {
  autoStart?: boolean;
}

export const useAuctionRevealFlow = ({ autoStart = true }: UseAuctionRevealFlowOptions = {}) => {
  const [step, setStep] = useState<RevealStep>(0);
  const [running, setRunning] = useState<boolean>(autoStart);

  useEffect(() => {
    if (!running) return;

    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < TIMERS.length; i++) {
        if (cancelled) return;
        setStep(i as RevealStep);
        await new Promise((resolve) => setTimeout(resolve, TIMERS[i]));
      }
      if (!cancelled) {
        setRunning(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [running]);

  const start = () => {
    setStep(0);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setStep(0);
  };

  return { step, running, start, reset };
};

export default useAuctionRevealFlow;
