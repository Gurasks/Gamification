import { CustomDropdown } from "@/components/CustomDropdown";
import {
  getPriorityOptions,
  getRequirementTypeOptions,
  getCategoryOptions
} from "@/services/metadataOptionsService";
import { CategoryType, Metadata, PriorityLevel, RequirementType } from "@/types/global";
import { Check, Settings, X } from "lucide-react";
import React, { useId } from "react";
import { useLanguage } from "@/hooks/useLanguage";

type CardMetadataEditorFormProps = {
  editedMetadata: Metadata;
  setEditedMetadata: React.Dispatch<React.SetStateAction<Metadata>>;
  handleSaveMetadata: () => void;
  setIsEditingMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  timeEnded: boolean;
}

const CardMetadataEditorForm: React.FC<CardMetadataEditorFormProps> = ({
  editedMetadata,
  setEditedMetadata,
  handleSaveMetadata,
  setIsEditingMetadata,
  timeEnded
}) => {
  const { t } = useLanguage();
  const priorityId = useId();
  const requirementTypeId = useId();
  const categoryId = useId();
  const effortId = useId();

  const priorityOptions = getPriorityOptions(t);
  const requirementTypeOptions = getRequirementTypeOptions(t);
  const categoryOptions = getCategoryOptions(t);

  const handlePriorityChange = (value: string) => {
    setEditedMetadata((prev) => ({
      ...prev,
      priority: value as PriorityLevel,
    }));
  };

  const handleRequirementTypeChange = (value: string) => {
    setEditedMetadata((prev) => ({
      ...prev,
      requirementType: value as RequirementType,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setEditedMetadata((prev) => ({
      ...prev,
      category: value as CategoryType,
    }));
  };

  const handleEstimatedEffortChange = (value: string) => {
    setEditedMetadata((prev) => ({
      ...prev,
      estimatedEffort: value === "" ? undefined : Number.parseFloat(value),
    }));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      {/* Edit title */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
          <Settings className="w-3 h-3" />
          {t('cardMetadata.editTitle')}
        </h4>
      </div>

      {/* Inline edit fields */}
      <div className="grid grid-cols-2 gap-2">
        {/* Priority */}
        <div className="col-span-2">
          <label
            htmlFor={priorityId}
            className="text-xs text-gray-600 mb-1 block"
          >
            {t('cardMetadata.priority')}
          </label>
          <CustomDropdown
            id={priorityId}
            value={editedMetadata.priority || ""}
            onChange={handlePriorityChange}
            options={priorityOptions}
            placeholder={t('cardMetadata.priorityPlaceholder')}
            disabled={timeEnded}
          />
        </div>

        {/* Requirement Type */}
        <div>
          <label
            htmlFor={requirementTypeId}
            className="text-xs text-gray-600 mb-1 block"
          >
            {t('cardMetadata.type')}
          </label>
          <CustomDropdown
            id={requirementTypeId}
            value={editedMetadata.requirementType || ""}
            onChange={handleRequirementTypeChange}
            options={requirementTypeOptions}
            placeholder={t('cardMetadata.typePlaceholder')}
            disabled={timeEnded}
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor={categoryId}
            className="text-xs text-gray-600 mb-1 block"
          >
            {t('cardMetadata.category')}
          </label>
          <CustomDropdown
            id={categoryId}
            value={editedMetadata.category || ""}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder={t('cardMetadata.categoryPlaceholder')}
            disabled={timeEnded}
          />
        </div>

        {/* Estimated Effort */}
        <div className="col-span-2">
          <label
            htmlFor={effortId}
            className="text-xs text-gray-600 mb-1 block"
          >
            {t('cardMetadata.estimatedEffort')}
          </label>
          <input
            id={effortId}
            type="number"
            min="0"
            step="0.5"
            value={editedMetadata.estimatedEffort === undefined ? "" : editedMetadata.estimatedEffort}
            onChange={(e) => {
              const value = e.target.value;
              handleEstimatedEffortChange(value);
            }}
            className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            placeholder={t('cardMetadata.effortPlaceholder')}
            disabled={timeEnded}
            aria-describedby={`${effortId}-description`}
          />
        </div>

        <div className="col-span-2 flex gap-1">
          <button
            onClick={handleSaveMetadata}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            title={t('cardMetadata.saveTitle')}
          >
            <Check className="w-3 h-3" />
            <span className="sr-only">{t('cardMetadata.save')}</span>
          </button>
          <button
            onClick={() => setIsEditingMetadata(false)}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            title={t('cardMetadata.cancelTitle')}
          >
            <X className="w-3 h-3" />
            <span className="sr-only">{t('cardMetadata.cancel')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardMetadataEditorForm;