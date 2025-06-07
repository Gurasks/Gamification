import { useState, useEffect } from 'react';

type TimerProps = {
  initialMinutes: number;
  initialSeconds: number;
  onComplete?: () => void;
};

const Timer = ({ initialMinutes, initialSeconds, onComplete }: TimerProps) => {
  const [time, setTime] = useState({
    minutes: initialMinutes,
    seconds: initialSeconds
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };

        clearInterval(timer);
        onComplete?.();
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const formattedTime = `${time.minutes.toString().padStart(2, '0')}:${time.seconds
    .toString()
    .padStart(2, '0')}`;
  const isLowTime = time.minutes === 0 && time.seconds <= 30;

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden ${isLowTime ? 'bg-red-400' : 'bg-indigo-500'
          } shadow-lg`}
      >
        {/* SVG Wave Inside Circle */}
        <svg
          className="absolute bottom-0 w-full h-2/5"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 10 Q 15 0 60 10 T 100 20 V 20 H 0 Z"
            fill="#ffffff"
            opacity="0.3"
          />
        </svg>

        {/* Timer Text */}
        <span className="text-white text-xl font-semibold font-mono z-10">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default Timer;