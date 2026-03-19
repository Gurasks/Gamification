import React from 'react';
import { ArrowUpDown, MessageSquare, Star, Clock, Pencil } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export type SortOption =
  | 'newest'      // Newest first
  | 'oldest'      // Oldest first
  | 'highest'     // Highest rating first
  | 'lowest'      // Lowest rating first
  | 'mostComments'// Most comments first
  | 'leastComments' // Least comments first
  | 'author';      // Sort by author alphabetically

interface CardSortingSelectorProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  hasAuthorOption?: boolean;
  showRatedOptions?: boolean;
}

const CardSortingSelector: React.FC<CardSortingSelectorProps> = ({
  sortBy,
  onSortChange,
  hasAuthorOption = true,
  showRatedOptions = true,
}) => {
  const { t } = useLanguage();

  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
      {
        value: 'newest',
        label: t('sorting:options.newest'),
        icon: <Clock className="w-4 h-4" />,
        description: t('sorting:descriptions.newest')
      },
      {
        value: 'oldest',
        label: t('sorting:options.oldest'),
        icon: <Clock className="w-4 h-4" />,
        description: t('sorting:descriptions.oldest')
      },
      {
        value: 'mostComments',
        label: t('sorting:options.mostComments'),
        icon: <MessageSquare className="w-4 h-4" />,
        description: t('sorting:descriptions.mostComments')
      },
      {
        value: 'leastComments',
        label: t('sorting:options.leastComments'),
        icon: <MessageSquare className="w-4 h-4" />,
        description: t('sorting:descriptions.leastComments')
      }
    ];

  if (showRatedOptions) {
    sortOptions.push({
      value: 'highest',
      label: t('sorting:options.highest'),
      icon: <Star className="w-4 h-4" />,
      description: t('sorting:descriptions.highest')
    },
      {
        value: 'lowest',
        label: t('sorting:options.lowest'),
        icon: <Star className="w-4 h-4" />,
        description: t('sorting:descriptions.lowest')
      }
    )
  }

  if (hasAuthorOption) {
    sortOptions.push(
      {
        value: 'author',
        label: t('sorting:options.author'),
        icon: <Pencil className="w-4 h-4" />,
        description: t('sorting:descriptions.author')
      });
  }

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t('sorting:sortBy')}:</span>
        </div>

        <div className="relative group">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Current sort description */}
      {currentSort && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
          {currentSort.icon}
          <span>{currentSort.description}</span>
        </div>
      )}

      {/* Quick sort buttons */}
      <div className="flex flex-wrap gap-1 justify-end">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${sortBy === option.value
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            title={option.description}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CardSortingSelector;