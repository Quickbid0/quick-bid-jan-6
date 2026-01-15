import { useState, useEffect } from 'react';

export const useCountdown = (endDate) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endDate) return;

    const endTs =
      endDate instanceof Date ? endDate.getTime() : new Date(endDate).getTime();

    if (Number.isNaN(endTs)) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const update = () => {
      const nowTs = Date.now();
      const distance = endTs - nowTs;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
      return false;
    };

    update();
    const interval = setInterval(() => {
      const done = update();
      if (done) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
};
