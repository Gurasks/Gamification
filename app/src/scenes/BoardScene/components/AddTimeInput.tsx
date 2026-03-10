import { getAdditionalTimeDisplay } from "@/services/boardServices";
import { useLanguage } from '@/hooks/useLanguage';

export const AddTimeInput: React.FC<{
  additionalTime: number;
  setAdditionalTime: (time: number) => void;
  handleAddTime: () => void;
  showTimeInput: boolean;
  setShowTimeInput: (show: boolean) => void;
  isAddingTime: boolean;
  timeUnit: 'minutes' | 'seconds';
  setTimeUnit: (unit: 'minutes' | 'seconds') => void;
}> = ({
  showTimeInput,
  setShowTimeInput,
  isAddingTime,
  additionalTime,
  setAdditionalTime,
  timeUnit,
  setTimeUnit,
  handleAddTime
}) => {
    const { t } = useLanguage();
    const additionalTimeDisplay = getAdditionalTimeDisplay(additionalTime);

    return (
      <>
        {showTimeInput ? (
          <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700">
                {t('addTime.addTimeLabel')}:
              </span>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={additionalTime}
                  onChange={(e) => setAdditionalTime(Number(e.target.value))}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder={t('addTime.timePlaceholder')}
                />

                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value as 'minutes' | 'seconds')}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="minutes">{t('timer.minutes')}</option>
                  <option value="seconds">{t('timer.seconds')}</option>
                </select>
              </div>

              <div className="flex gap-2 justify-between">
                <button
                  onClick={() => handleAddTime()}
                  disabled={isAddingTime || additionalTime <= 0}
                  className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {isAddingTime ? t('addTime.adding') : t('addTime.add')}
                </button>

                <button
                  onClick={() => setShowTimeInput(false)}
                  disabled={isAddingTime}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {t('addTime.cancel')}
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                {timeUnit === 'minutes'
                  ? `${additionalTime} ${additionalTime === 1 ? t('timer.minute') : t('timer.minutes')} = ${additionalTime * 60} ${t('timer.seconds')}`
                  : `${additionalTime} ${additionalTime === 1 ? t('timer.second') : t('timer.seconds')}`
                }
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowTimeInput(true)}
            disabled={isAddingTime}
            className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {t('addTime.addTime')}
          </button>
        )}
      </>
    );
  };