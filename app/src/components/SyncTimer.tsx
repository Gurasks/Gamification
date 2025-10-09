import { useState, useEffect } from 'react';
import { createUnsubscribeSyncTimer } from '../hooks/firestoreUnsubscriber';
import { updateTimeToSyncTimerInFirebase } from '../services/firestoreServices';
import { returnToastMessage } from '../services/globalServices';

interface SyncTimerProps {
  timerId: string;
}

const SyncTimer = ({ timerId }: SyncTimerProps) => {

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [endTime, setEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribeSyncTimer = createUnsubscribeSyncTimer(
      timerId,
      setTimeLeft,
      setIsRunning,
      setEndTime
    );

    return () => unsubscribeSyncTimer();
  }, [timerId]);

  useEffect(() => {
    if (!isRunning || !endTime || !timeLeft) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setIsRunning(false);
        returnToastMessage('Tempo esgotado!', 'timer');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, endTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(timeLeft);
  const isLowTime = timeLeft <= 30;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden ${isLowTime ? 'bg-red-400' : 'bg-indigo-500'
        } shadow-lg`}>
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

        <span className="text-white text-xl font-semibold font-mono z-10">
          {formattedTime}
        </span>
      </div>

      {timeLeft === 0 && (
        <button
          onClick={() => updateTimeToSyncTimerInFirebase(timerId, timeLeft, 60)}
          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          +1 Minuto
        </button>
      )}
    </div>
  );
};

export default SyncTimer;
