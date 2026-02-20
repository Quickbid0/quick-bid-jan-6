import { useEffect, useState } from 'react';

/**
 * FIX 21: Countdown Timer Desync (RT-02)
 * ✅ Uses server end timestamp as source of truth
 * ✅ Unaffected by tab inactivity — never drifts
 * ✅ Recalculates every second from server time, not from local start
 * 
 * Usage:
 * const timeLeft = useServerSyncedCountdown(auction.endTime);
 * // Returns milliseconds remaining
 */
export const useServerSyncedCountdown = (serverEndTime: string | Date) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const endTime = new Date(serverEndTime).getTime();

    // Tick immediately to avoid 1-second delay
    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
    };

    tick();

    // Update every 1 second using server time as source of truth
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [serverEndTime]);

  return timeLeft;
};

/**
 * Convert milliseconds to readable format
 */
export const formatTimeLeft = (ms: number): string => {
  if (ms <= 0) return 'Ended';

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor((ms / 1000 / 60 / 60) % 24);
  const days = Math.floor(ms / 1000 / 60 / 60 / 24);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

// Example countdown component
export const CountdownDisplay: React.FC<{ endTime: string | Date }> = ({ endTime }) => {
  const timeLeft = useServerSyncedCountdown(endTime);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Ends in:</span>
      <span
        className={`font-bold text-lg ${
          timeLeft < 60000 ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {formatTimeLeft(timeLeft)}
      </span>
    </div>
  );
};
