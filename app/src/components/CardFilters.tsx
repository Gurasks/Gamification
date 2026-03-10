import React from 'react';
import { PriorityLevel, CategoryType } from '@/types/global';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getPriorityOptions,
  getCategoryOptions,
  getPriorityOption,
  getCategoryOption,
  metadataIcons
} from '@/services/metadataOptionsService';
import type { MetadataOption } from '@/services/metadataOptionsService';

interface CardFiltersProps {
  priority: PriorityLevel[];
  setPriority: (priority: PriorityLevel[]) => void;
  category: CategoryType[];
  setCategory: (category: CategoryType[]) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const CardFilters: React.FC<CardFiltersProps> = ({
  priority,
  setPriority,
  category,
  setCategory,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { t } = useLanguage();

  const priorityOptions = getPriorityOptions(t);
  const categoryOptions = getCategoryOptions(t);

  const togglePriority = (p: PriorityLevel) => {
    if (priority.includes(p)) {
      setPriority(priority.filter(item => item !== p));
    } else {
      setPriority([...priority, p]);
    }
  };

  const toggleCategory = (c: CategoryType) => {
    if (category.includes(c)) {
      setCategory(category.filter(item => item !== c));
    } else {
      setCategory([...category, c]);
    }
  };

  const clearFilters = () => {
    setPriority([]);
    setCategory([]);
  };

  const hasFilters = priority.length > 0 || category.length > 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {/* Cabeçalho dos Filtros */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {t('filters.title')}
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
              {priority.length + category.length}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            {t('filters.clearAll')}
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          {/* Priority filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {metadataIcons.priority}
              <div className="text-sm font-medium text-gray-700">
                {t('filters.priority')}
              </div>
              {priority.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({priority.length} {priority.length === 1 ? t('filters.selected') : t('filters.selectedPlural')})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option: MetadataOption<PriorityLevel>) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => togglePriority(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${priority.includes(option.value)
                    ? `${option.bgColor} ${option.color} ${option.borderColor} font-medium shadow-sm`
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {metadataIcons.category}
              <div className="text-sm font-medium text-gray-700">
                {t('filters.category')}
              </div>
              {category.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({category.length} {category.length === 1 ? t('filters.selected') : t('filters.selectedPlural')})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option: MetadataOption<CategoryType>) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleCategory(option.value)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-all ${category.includes(option.value)
                    ? `${option.bgColor} ${option.color} ${option.borderColor} font-medium shadow-sm`
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {hasFilters && (
        <div className={`flex flex-wrap gap-2 ${isExpanded ? 'mt-4 pt-4 border-t border-gray-200' : 'mt-2'}`}>
          {priority.map(p => {
            const option = getPriorityOption(p, t);
            if (!option) return null;

            return (
              <span
                key={p}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border ${option.bgColor} ${option.color} ${option.borderColor}`}
              >
                {option.icon}
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => togglePriority(p)}
                  className="p-0.5 hover:opacity-80 rounded-full transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {category.map(c => {
            const option = getCategoryOption(c, t);
            if (!option) return null;

            return (
              <span
                key={c}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border ${option.bgColor} ${option.color} ${option.borderColor}`}
              >
                {option.icon}
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className="p-0.5 hover:opacity-80 rounded-full transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};