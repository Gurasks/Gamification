
import { useState, useEffect } from 'react';

type Props = {
  initialMinutes: number;
  initialSeconds: number;
  onComplete?: () => void; // Optional completion callback
};

const Timer = ({ initialMinutes, initialSeconds, onComplete }: Props) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    // Check if time is critical (last 30 seconds)
    setIsCritical(minutes === 0 && seconds <= 30);
  }, [minutes, seconds]);

  useEffect(() => {
    const getTime = () => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        onComplete?.(); // Trigger completion callback
      }
    };

    const interval = setInterval(getTime, 1000);
    return () => clearInterval(interval);
  }, [minutes, seconds, onComplete]);

  const formattedTime = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

  return (
    <div
      className={`
          flex items-center justify-center
          ${isCritical ? 'animate-pulse' : ''}
        `}
      role="timer"
      aria-live="assertive"
    >
      <div className={`
                relative
                bg-gradient-to-br ${isCritical ? 'from-red-600 to-red-800' : 'from-blue-600 to-blue-800'}
                text-white
                rounded-md
                p-6
                shadow-lg
                ${isCritical ? 'shadow-red-500/30' : 'shadow-blue-500/30'}
                transition-all duration-300
                min-w-[120px]
                text-center
                `}
      >
        <span className="text-4xl font-mono font-bold tracking-tighter">
          {formattedTime}
        </span>

        {/* Progress ring background */}
        <div className="absolute inset-0 rounded-md border-4 border-transparent">
          {/* Animated progress ring */}
          <div
            className={`
                            absolute top-0 left-0 w-full h-full rounded-md
                            border-4 ${isCritical ? 'border-red-400' : 'border-blue-400'}
                            opacity-20
                        `}
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default Timer;
