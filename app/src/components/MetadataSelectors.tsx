import metadataService from '@/services/metadataOptionsService';
import { CategoryType, PriorityLevel, RequirementType } from '@/types/global';
import { AlertCircle, Layers } from 'lucide-react';
import React, { useId } from 'react';
import { CustomDropdown } from './CustomDropdown';

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
  const effortInputId = useId();

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
          label="Prioridade"
        />

        {/* Tipo de Requisito */}
        <CustomDropdown
          value={requirementType}
          onChange={setRequirementType as (type: string) => void}
          disabled={disabled}
          placeholder="Tipo de requisito..."
          options={metadataService.getCustomDropdownOptions.requirementType}
          label="Tipo de requisito"
        />

        {/* Categoria */}
        <CustomDropdown
          value={category}
          onChange={setCategory as (category: string) => void}
          disabled={disabled}
          placeholder="Categoria..."
          options={metadataService.getCustomDropdownOptions.category}
          label="Categoria"
        />

        {/* Esforço Estimado */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={effortInputId}
            className="text-start text-xs font-medium text-gray-600 mb-1"
          >
            Esforço estimado
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
            placeholder="Ex: 2"
            disabled={disabled}
            aria-describedby={`${effortInputId}-description`}
          />
        </div>
      </div>

      {/* Dicas de uso */}
      <div className="text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Adicione metadados para ajudar na organização e priorização das sugestões durante a revisão.</p>
      </div>
    </div>
  );
};