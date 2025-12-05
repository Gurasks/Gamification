import metadataService from '@/services/metadataOptionsService';
import { CategoryType, PriorityLevel, RequirementType } from '@/types/global';
import { AlertCircle, Layers } from 'lucide-react';
import React from 'react';
import { CustomDropdown } from './CustomDropdown';
import { CustomTagInput } from './CustomTagInput';

interface MetadataSelectorsProps {
  priority: PriorityLevel | '';
  setPriority: (priority: PriorityLevel) => void;
  requirementType: RequirementType | '';
  setRequirementType: (type: RequirementType) => void;
  category: CategoryType | '';
  setCategory: (category: CategoryType) => void;
  estimatedEffort: number | '';
  setEstimatedEffort: (effort: number) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
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
  tags,
  setTags,
  disabled = false
}) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Layers className="w-4 h-4" />
        Metadados da Sugestão
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Prioridade */}
        <CustomDropdown
          value={priority}
          onChange={setPriority as (level: string) => void}
          disabled={disabled}
          placeholder="Prioridade..."
          options={metadataService.getCustomDropdownOptions.priority}
        />

        {/* Tipo de Requisito */}
        <CustomDropdown
          value={requirementType}
          onChange={setRequirementType as (type: string) => void}
          disabled={disabled}
          placeholder="Tipo de requisito..."
          options={metadataService.getCustomDropdownOptions.requirementType}
        />

        {/* Categoria - usando CustomDropdown */}
        <CustomDropdown
          value={category}
          onChange={setCategory as (category: string) => void}
          disabled={disabled}
          placeholder="Categoria..."
          options={metadataService.getCustomDropdownOptions.category}
        />

        {/* Esforço Estimado */}
        <div className="flex flex-col gap-1">
          <label className="text-start text-xs font-medium text-gray-600 mb-1">
            Esforço estimado
          </label>

          <input
            type="number"
            min="0"
            step="0.5"
            value={estimatedEffort}
            onChange={(e) => setEstimatedEffort(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className="w-full text-sm p-2 border border-gray-300 rounded-md
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Ex: 2"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1 space-y-2">
        <label className="block text-start text-s font-medium text-gray-600 mb-1">
          Tags
        </label>
        <CustomTagInput
          tags={tags}
          onTagsChange={setTags}
          disabled={disabled}
          placeholder="Digite uma tag e pressione Enter..."
          maxTags={10}
        />
      </div>

      {/* Dicas de uso */}
      <div className="text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Adicione metadados para ajudar na organização e priorização das sugestões durante a revisão.</p>
      </div>
    </div>
  );
};