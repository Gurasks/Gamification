import React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CollapsibleDescriptionAreaProps {
  sessionDescription: string;
  showDescription: boolean;
  setShowDescription: (show: boolean) => void;
}

const CollapsibleDescriptionArea: React.FC<CollapsibleDescriptionAreaProps> = ({
  sessionDescription,
  showDescription,
  setShowDescription
}) => {
  const { t } = useLanguage();

  const handleToggle = () => {
    setShowDescription(!showDescription);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-expanded={showDescription}
        aria-controls="session-description-content"
      >
        <div className="flex items-center space-x-3">
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showDescription ? 'rotate-180' : ''
              }`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-gray-700">
            {t('collapsible.sessionDescription')}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {showDescription ? t('collapsible.hide') : t('collapsible.show')}
        </span>
      </button>

      {showDescription && (
        <div
          id="session-description-content"
          className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn"
          role="region"
          aria-labelledby="session-description-button"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" aria-hidden="true" />
            <p
              className="text-gray-700 leading-relaxed whitespace-pre-wrap text-left flex-1"
              style={{ wordWrap: 'break-word' }}
            >
              {sessionDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleDescriptionArea;