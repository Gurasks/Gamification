import React from 'react';
import { ArrowUpDown, MessageSquare, Star, Clock, Pencil } from 'lucide-react';

export type SortOption =
  | 'newest'      // Mais recentes primeiro
  | 'oldest'      // Mais antigos primeiro
  | 'highest'     // Maior rating primeiro
  | 'lowest'      // Menor rating primeiro
  | 'mostComments'// Mais comentários primeiro
  | 'leastComments' // Menos comentários primeiro
  | 'author';      // Ordenar por autor alfabeticamente

interface CardSortingSelectorProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const CardSortingSelector: React.FC<CardSortingSelectorProps> = ({ sortBy, onSortChange }) => {
  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
      {
        value: 'newest',
        label: 'Mais Recentes',
        icon: <Clock className="w-4 h-4" />,
        description: 'Ordena pelos cards mais recentes primeiro'
      },
      {
        value: 'oldest',
        label: 'Mais Antigos',
        icon: <Clock className="w-4 h-4" />,
        description: 'Ordena pelos cards mais antigos primeiro'
      },
      {
        value: 'highest',
        label: 'Maior Avaliação',
        icon: <Star className="w-4 h-4" />,
        description: 'Ordena pelos cards com melhor avaliação primeiro'
      },
      {
        value: 'lowest',
        label: 'Menor Avaliação',
        icon: <Star className="w-4 h-4" />,
        description: 'Ordena pelos cards com pior avaliação primeiro'
      },
      {
        value: 'mostComments',
        label: 'Mais Comentários',
        icon: <MessageSquare className="w-4 h-4" />,
        description: 'Ordena pelos cards com mais comentários primeiro'
      },
      {
        value: 'leastComments',
        label: 'Menos Comentários',
        icon: <MessageSquare className="w-4 h-4" />,
        description: 'Ordena pelos cards com menos comentários primeiro'
      },
      {
        value: 'author',
        label: 'Por Autor',
        icon: <Pencil className="w-4 h-4" />,
        description: 'Ordena pelos cards por autor alfabeticamente'
      },
    ];

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
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

      {/* Descrição da ordenação atual */}
      {currentSort && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-md">
          {currentSort.icon}
          <span>{currentSort.description}</span>
        </div>
      )}

      {/* Botões de ordenação rápida*/}
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