import { getButtonClass, getTypeText } from '@/services/metadataVoteServices';
import { MetadataType, VoteValue } from '@/types/global';
import { Check, Minus, ThumbsDown, ThumbsUp } from 'lucide-react';
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface MetadataVoteProps {
  metadataType: MetadataType;
  metadataValue: string | number;
  metadataLabel?: string;
  currentVote?: VoteValue;
  onVote: (vote: VoteValue) => void;
  isReadOnly?: boolean;
  agreeCount?: number;
  disagreeCount?: number;
  neutralCount?: number;
}

const MetadataVote: React.FC<MetadataVoteProps> = ({
  metadataType,
  metadataValue,
  metadataLabel,
  currentVote,
  onVote,
  isReadOnly = false,
  agreeCount = 0,
  disagreeCount = 0,
  neutralCount = 0
}) => {
  const { t } = useLanguage();
  const totalVotes = agreeCount + disagreeCount + neutralCount;
  const agreementPercentage = totalVotes > 0 ? Math.round((agreeCount / totalVotes) * 100) : 0;

  if (isReadOnly) {
    return (
      <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium text-gray-700">
            {metadataLabel || metadataValue}
          </div>
          {totalVotes > 0 && (
            <div className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              {agreementPercentage}% {t('metadataVote.agree')}
            </div>
          )}
        </div>

        {totalVotes > 0 ? (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-600 font-medium">{agreeCount}</span>
              <span className="text-gray-500">{t('metadataVote.agreeCount')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-red-600 font-medium">{disagreeCount}</span>
              <span className="text-gray-500">{t('metadataVote.disagreeCount')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-yellow-600 font-medium">{neutralCount}</span>
              <span className="text-gray-500">{t('metadataVote.neutralCount')}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            {t('metadataVote.noVotes')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="mb-3">
        <div className="mb-3">
          <div className="text-sm font-semibold text-blue-800 mb-1">
            {t('metadataVote.question', {
              type: getTypeText(metadataType, t),
              value: metadataLabel || metadataValue
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onVote('agree')}
          className={getButtonClass(currentVote, 'agree')}
          disabled={isReadOnly}
          title={t('metadataVote.tooltip.agree')}
        >
          <ThumbsUp className="w-4 h-4" />
          {t('metadataVote.agree')}
          {currentVote === 'agree' && <Check className="w-3 h-3 ml-1" />}
        </button>

        <button
          onClick={() => onVote('neutral')}
          className={getButtonClass(currentVote, 'neutral')}
          disabled={isReadOnly}
          title={t('metadataVote.tooltip.neutral')}
        >
          <Minus className="w-4 h-4" />
          {t('metadataVote.neutral')}
          {currentVote === 'neutral' && <Check className="w-3 h-3 ml-1" />}
        </button>

        <button
          onClick={() => onVote('disagree')}
          className={getButtonClass(currentVote, 'disagree')}
          disabled={isReadOnly}
          title={t('metadataVote.tooltip.disagree')}
        >
          <ThumbsDown className="w-4 h-4" />
          {t('metadataVote.disagree')}
          {currentVote === 'disagree' && <Check className="w-3 h-3 ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default MetadataVote;