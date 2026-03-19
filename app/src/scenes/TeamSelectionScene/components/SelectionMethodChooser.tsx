import React from 'react';
import { Shuffle, Users, UserCog, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import type { SelectionMethod } from '../../../types/teamSelection';

interface SelectionMethodChooserProps {
  currentMethod: SelectionMethod;
  onMethodChange: (method: SelectionMethod) => void;
  isOwner: boolean;
}

const SelectionMethodChooser: React.FC<SelectionMethodChooserProps> = ({
  currentMethod,
  onMethodChange,
  isOwner,
}) => {
  const { t } = useLanguage();

  const methods = [
    {
      value: 'RANDOM' as SelectionMethod,
      icon: Shuffle,
      label: t('team:selection.methods.random'),
      description: t('team:selection.methods.randomDesc'),
      alwaysShow: true,
    },
    {
      value: 'CHOOSE_YOUR_TEAM' as SelectionMethod,
      icon: Users,
      label: t('team:selection.methods.chooseTeam'),
      description: t('team:selection.methods.chooseTeamDesc'),
      alwaysShow: true,
    },
    {
      value: 'OWNER_CHOOSES' as SelectionMethod,
      icon: UserCog,
      label: t('team:selection.methods.ownerChooses'),
      description: t('team:selection.methods.ownerChoosesDesc'),
      alwaysShow: false,
      requiresOwner: true,
    },
  ];

  const visibleMethods = methods.filter(
    method => method.alwaysShow || (method.requiresOwner && isOwner)
  );

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {t('team:selection.methods.title')}
        </h3>
        <div
          className="relative group"
          aria-label={t('team:selection.methods.helpTooltip')}
        >
          <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
            {t('team:selection.methods.helpText')}
          </div>
        </div>
      </div>

      <div className="space-y-3" role="radiogroup" aria-labelledby="selection-method-title">
        {visibleMethods.map(({ value, icon: Icon, label, description }) => (
          <label
            key={value}
            className={`flex items-start p-3 space-x-3 rounded-lg border-2 transition-all cursor-pointer ${currentMethod === value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
          >
            <input
              type="radio"
              name="selectionMethod"
              value={value}
              checked={currentMethod === value}
              onChange={() => onMethodChange(value)}
              className="sr-only" // Screen reader only - visual styling handled by parent
              aria-describedby={`${value.toLowerCase()}-desc`}
            />
            <div className="flex-shrink-0 mt-0.5">
              <Icon
                className={`w-5 h-5 ${currentMethod === value ? 'text-blue-500' : 'text-gray-400'
                  }`}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-right gap-2">
                <span
                  className={`font-medium ${currentMethod === value ? 'text-blue-700' : 'text-gray-700'
                    }`}
                >
                  {label}
                </span>
                <span
                  id={`${value.toLowerCase()}-desc`}
                  className="text-sm text-gray-500 mt-1"
                >
                  - {description}
                </span>
              </div>

            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SelectionMethodChooser;