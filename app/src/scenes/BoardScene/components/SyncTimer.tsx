import { useState, useEffect } from 'react';
import { createUnsubscribeSyncTimer } from '@/hooks/firestoreUnsubscriber';
import { updateTimeToSyncTimerInFirebase } from '@/services/firestore/firestoreServices';
import { returnToastMessage } from '@/services/globalServices';
import { User } from 'firebase/auth';
import { SyncTimerSkelleton } from './SyncTimerSkelleton';
import { AddTimeInput } from './AddTimeInput';
import { getAdditionalTimeDisplay } from '@/services/boardServices';

interface SyncTimerProps {
  timerId: string;
  user: User;
  currentTeam: string;
  sessionTeams: Record<string, string>;
  onTimeEnd?: () => void;
  onTimerStateChange?: (hasEnded: boolean) => void;
  onTimerLoaded?: () => void;
  isSessionClosed?: boolean;
}

const SyncTimer = ({
  timerId,
  user,
  currentTeam,
  sessionTeams,
  onTimeEnd,
  onTimerStateChange,
  onTimerLoaded,
  isSessionClosed = false
}: SyncTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isAddingTime, setIsAddingTime] = useState<boolean>(false);
  const [timerLoaded, setTimerLoaded] = useState<boolean>(false);
  const [showTimeInput, setShowTimeInput] = useState<boolean>(false);
  const [additionalTime, setAdditionalTime] = useState<number>(1);
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'seconds'>('minutes');

  // Verifica se o usuário atual pertence ao time atual
  const userTeam = sessionTeams[user.uid];
  const canAddTime = userTeam === currentTeam;

  const setTimeForSubscriber = (newTimeLeft: number) => {
    setTimeLeft(newTimeLeft);

    if (!timerLoaded) {
      setTimerLoaded(true);
      onTimerLoaded?.();
    }

    if (newTimeLeft <= 0 && !hasEnded) {
      setHasEnded(true);
      setIsRunning(false);
      onTimeEnd?.();
      onTimerStateChange?.(true);
    } else if (newTimeLeft > 0 && hasEnded) {
      setHasEnded(false);
      onTimerStateChange?.(false);
    }
  };

  useEffect(() => {
    if (!timerId) return;

    const unsubscribeSyncTimer = createUnsubscribeSyncTimer(
      timerId,
      setTimeForSubscriber,
      setIsRunning,
      setEndTime
    );

    return () => unsubscribeSyncTimer();
  }, [timerId, hasEnded, timerLoaded, onTimeEnd, onTimerStateChange, onTimerLoaded]);

  useEffect(() => {
    if (!isRunning || !endTime || timeLeft <= 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasEnded) {
        setHasEnded(true);
        setIsRunning(false);
        onTimeEnd?.();
        onTimerStateChange?.(true);
        returnToastMessage('Tempo esgotado!', 'timer');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, endTime, timeLeft, hasEnded, onTimeEnd, onTimerStateChange]);

  const handleAddTime = async (customSeconds?: number) => {
    if (isAddingTime || !canAddTime) return;

    setIsAddingTime(true);
    try {
      const secondsToAdd = customSeconds || (timeUnit === 'minutes' ? additionalTime * 60 : additionalTime);

      await updateTimeToSyncTimerInFirebase(timerId, secondsToAdd);

      setHasEnded(false);
      setIsRunning(true);
      setShowTimeInput(false);
      onTimerStateChange?.(false);

      const additionalTimeDisplay = getAdditionalTimeDisplay(additionalTime);

      const timeText = timeUnit === 'minutes'
        ? `${additionalTime} minuto${additionalTimeDisplay}`
        : `${additionalTime} segundo${additionalTimeDisplay}`;

      returnToastMessage(`+${timeText} adicionado!`, 'success');
    } catch (error) {
      console.error('Error adding time:', error);
      returnToastMessage('Erro ao adicionar tempo', 'error');
    } finally {
      setIsAddingTime(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(timeLeft);
  const isLowTime = timeLeft > 0 && timeLeft <= 30;

  // Mostrar loading enquanto o timer não carregou
  if (!timerLoaded) {
    return <SyncTimerSkelleton />;
  }

  const isLowTimeStyle = isLowTime ? 'bg-red-400' : 'bg-indigo-500';

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Timer Circle */}
      <div className={`relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden ${hasEnded ? 'bg-gray-500' : isLowTimeStyle} shadow-lg`}>
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
          {hasEnded ? '00:00' : formattedTime}
        </span>
      </div>

      {/* Botões quando o tempo acabou */}
      {hasEnded && !isSessionClosed && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {canAddTime ? <AddTimeInput
            additionalTime={additionalTime}
            setAdditionalTime={setAdditionalTime}
            handleAddTime={handleAddTime}
            showTimeInput={showTimeInput}
            setShowTimeInput={setShowTimeInput}
            isAddingTime={isAddingTime}
            timeUnit={timeUnit}
            setTimeUnit={setTimeUnit}
          /> : (
            // Mensagem quando não pode adicionar tempo
            <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                ⚠️ Apenas membros do <strong>{currentTeam}</strong> podem adicionar tempo
              </p>
            </div>
          )}
        </div>
      )}

      {/* Indicador de loading */}
      {isAddingTime && (
        <div className="text-xs text-gray-500">
          Atualizando timer...
        </div>
      )}
    </div>
  );
};

export default SyncTimer;