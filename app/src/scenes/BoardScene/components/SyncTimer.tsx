import { useState, useEffect } from 'react';
import { createUnsubscribeSyncTimer } from '@/hooks/firestoreUnsubscriber';
import { updateTimeToSyncTimerInFirebase } from '@/services/firestore/firestoreServices';
import { returnToastMessage } from '@/services/globalServices';
import { User } from 'firebase/auth';

interface SyncTimerProps {
  timerId: string;
  user: User;
  currentTeam: string;
  sessionTeams: Record<string, string>;
  onTimeEnd?: () => void;
  onTimerStateChange?: (hasEnded: boolean) => void;
  onTimerLoaded?: () => void;
}

const SyncTimer = ({
  timerId,
  user,
  currentTeam,
  sessionTeams,
  onTimeEnd,
  onTimerStateChange,
  onTimerLoaded
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

  useEffect(() => {
    if (!timerId) return;

    const unsubscribeSyncTimer = createUnsubscribeSyncTimer(
      timerId,
      (newTimeLeft) => {
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
      },
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

      const timeText = timeUnit === 'minutes'
        ? `${additionalTime} minuto${additionalTime > 1 ? 's' : ''}`
        : `${additionalTime} segundo${additionalTime > 1 ? 's' : ''}`;

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
  const isLowTime = timeLeft <= 30 && timeLeft > 0;

  // Mostrar loading enquanto o timer não carregou
  if (!timerLoaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden bg-gray-200 shadow-lg">
          <div className="text-white text-xl font-semibold font-mono z-10">
            ...
          </div>
        </div>
        <span className="text-xs text-gray-500">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Timer Circle */}
      <div className={`relative w-20 h-20 flex items-center justify-center rounded-full overflow-hidden ${hasEnded ? 'bg-gray-500' : isLowTime ? 'bg-red-400' : 'bg-indigo-500'
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
          {hasEnded ? '00:00' : formattedTime}
        </span>
      </div>

      {/* Botões quando o tempo acabou */}
      {hasEnded && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {canAddTime ? (
            <>
              {/* Input customizado */}
              {!showTimeInput ? (
                <button
                  onClick={() => setShowTimeInput(true)}
                  disabled={isAddingTime}
                  className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  Adicionar tempo
                </button>
              ) : (
                <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">
                      Adicionar tempo:
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={additionalTime}
                        onChange={(e) => setAdditionalTime(Number(e.target.value))}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Tempo"
                      />

                      <select
                        value={timeUnit}
                        onChange={(e) => setTimeUnit(e.target.value as 'minutes' | 'seconds')}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="minutes">Minutos</option>
                        <option value="seconds">Segundos</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-between">
                      <button
                        onClick={() => handleAddTime()}
                        disabled={isAddingTime || additionalTime <= 0}
                        className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        {isAddingTime ? 'Adicionando...' : 'Adicionar'}
                      </button>

                      <button
                        onClick={() => setShowTimeInput(false)}
                        disabled={isAddingTime}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      {timeUnit === 'minutes'
                        ? `${additionalTime} minuto${additionalTime > 1 ? 's' : ''} = ${additionalTime * 60} segundos`
                        : `${additionalTime} segundo${additionalTime > 1 ? 's' : ''}`
                      }
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
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