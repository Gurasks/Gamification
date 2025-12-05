import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';

interface CustomTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export const CustomTagInput: React.FC<CustomTagInputProps> = ({
  tags,
  onTagsChange,
  disabled = false,
  placeholder = 'Adicionar tag...',
  maxTags = 5,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Campo de input para tags */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Tag className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || tags.length >= maxTags}
            placeholder={tags.length >= maxTags ? `Limite de ${maxTags} tags atingido` : placeholder}
            className={`
              flex-1 pl-10 pr-3 py-2.5 text-sm
              bg-white border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={disabled || !inputValue.trim() || tags.length >= maxTags}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Tags existentes */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200"
            >
              <Tag className="w-3 h-3" />
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {tags.length >= maxTags && (
            <span className="text-xs text-gray-500 mt-1">
              Limite de {maxTags} tags atingido
            </span>
          )}
        </div>
      )}
    </div>
  );
};