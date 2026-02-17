import React from 'react';

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
      <Fragment mode="popLayout">
        <div
          key={value}
}
}
}
}
          className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
        >
          {value}
        </div>
      </Fragment>
    </div>
  );
};

export default Countdown;
