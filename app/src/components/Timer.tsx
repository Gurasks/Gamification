import { useState, useEffect } from 'react';

type TimerProps = {
  minutesLeft: number;
  secondsLeft: number;
  onComplete?: () => void;
  onAddMinute: () => void;
};

const Timer = ({ minutesLeft, secondsLeft, onComplete, onAddMinute }: TimerProps) => {
  const [time, setTime] = useState({
    minutes: minutesLeft,
    seconds: secondsLeft
  });
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setTime({ minutes: minutesLeft, seconds: secondsLeft });
    setIsCompleted(false); // Reset completion state when initial time changes
  }, [minutesLeft, secondsLeft]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };

        clearInterval(timer);
        if (!isCompleted) {
          setIsCompleted(true);
          onComplete?.();
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete, isCompleted]);

  const handleAddMinute = () => {
    if (isCompleted && onAddMinute) {
      setIsCompleted(false);
      onAddMinute();
    }
  };

  const formattedTime = `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')
    }`;
  const isLowTime = time.minutes === 0 && time.seconds <= 30;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden ${isLowTime ? 'bg-red-400' : 'bg-indigo-500'
        } shadow-lg`}>
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

      {/* Add Minute Button (only shows when timer completes) */}
      {isCompleted && (
        <button
          onClick={handleAddMinute}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          +1 Minuto
        </button>
      )}
    </div>
  );
};

export default Timer;