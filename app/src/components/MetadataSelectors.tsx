import { getPriorityOptions, getRequirementTypeOptions, getCategoryOptions } from '@/services/metadataOptionsService';
import { CategoryType, PriorityLevel, RequirementType } from '@/types/global';
import { AlertCircle, Layers } from 'lucide-react';
import React, { useId } from 'react';
import { CustomDropdown } from './CustomDropdown';
import { useLanguage } from '@/hooks/useLanguage';

interface MetadataSelectorsProps {
  priority: PriorityLevel | '';
  setPriority: (priority: PriorityLevel) => void;
  requirementType: RequirementType | '';
  setRequirementType: (type: RequirementType) => void;
  category: CategoryType | '';
  setCategory: (category: CategoryType) => void;
  estimatedEffort: number | '';
  setEstimatedEffort: (effort: number | '') => void;
  disabled?: boolean;
}

export const MetadataSelectors: React.FC<MetadataSelectorsProps> = ({
  priority,
  setPriority,
  requirementType,
  setRequirementType,
  category,
  setCategory,
  estimatedEffort,
  setEstimatedEffort,
  disabled = false
}) => {
  const { t } = useLanguage();
  const effortInputId = useId();

  const priorityOptions = getPriorityOptions(t);
  const requirementTypeOptions = getRequirementTypeOptions(t);
  const categoryOptions = getCategoryOptions(t);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Layers className="w-4 h-4" />
        {t('metadata:selector.title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Priority */}
        <CustomDropdown
          value={priority}
          onChange={setPriority as (level: string) => void}
          disabled={disabled}
          placeholder={t('metadata:selector.priorityPlaceholder')}
          options={priorityOptions}
          label={t('metadata:selector.priority')}
        />

        {/* Requirement Type */}
        <CustomDropdown
          value={requirementType}
          onChange={setRequirementType as (type: string) => void}
          disabled={disabled}
          placeholder={t('metadata:selector.requirementTypePlaceholder')}
          options={requirementTypeOptions}
          label={t('metadata:selector.requirementType')}
        />

        {/* Category */}
        <CustomDropdown
          value={category}
          onChange={setCategory as (category: string) => void}
          disabled={disabled}
          placeholder={t('metadata:selector.categoryPlaceholder')}
          options={categoryOptions}
          label={t('metadata:selector.category')}
        />

        {/* Estimated Effort */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={effortInputId}
            className="text-start text-xs font-medium text-gray-600 mb-1"
          >
            {t('metadata:selector.estimatedEffort')}
          </label>

          <input
            id={effortInputId}
            type="number"
            min="0"
            step="0.5"
            value={estimatedEffort ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setEstimatedEffort(value === '' ? '' : Number.parseFloat(value));
            }}
            className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder={t('metadata:selector.effortPlaceholder')}
            disabled={disabled}
            aria-describedby={`${effortInputId}-description`}
          />
        </div>
      </div>

      {/* Usage tips */}
      <div className="text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{t('metadata:selector.tip')}</p>
      </div>
    </div>
  );
};