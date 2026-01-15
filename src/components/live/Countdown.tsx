import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  seconds: number;
}

export const Countdown: React.FC<CountdownProps> = ({ seconds }) => {
  const [value, setValue] = React.useState(seconds);

  React.useEffect(() => {
    setValue(seconds);
  }, [seconds]);

  React.useEffect(() => {
    if (value <= 0) return;
    const id = setInterval(() => {
      setValue((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [value]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ scale: 0.3, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -40 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Countdown;
