import { CustomDropdown } from "@/components/CustomDropdown";
import { categoryOptions, priorityOptions, requirementTypeOptions } from "@/services/metadataOptionsService";
import { CategoryType, Metadata, PriorityLevel, RequirementType } from "@/types/global";
import { Check, Settings, X } from "lucide-react";

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
      estimatedEffort: value === "" ? undefined : parseFloat(value),
    }));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      {/* Título da edição */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
          <Settings className="w-3 h-3" />
          Editando Metadados
        </h4>
      </div>

      {/* Campos de edição inline */}
      <div className="grid grid-cols-2 gap-2">
        {/* Prioridade */}
        <div className="col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">Prioridade</label>
          <CustomDropdown
            value={editedMetadata.priority || "ND"}
            onChange={handlePriorityChange}
            options={priorityOptions}
            placeholder="Prioridade..."
            disabled={timeEnded}
          />
        </div>

        {/* Tipo de Requisito */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Tipo</label>
          <CustomDropdown
            value={editedMetadata.requirementType || "ND"}
            onChange={handleRequirementTypeChange}
            options={requirementTypeOptions}
            placeholder="Tipo de requisito..."
            disabled={timeEnded}
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Categoria</label>
          <CustomDropdown
            value={editedMetadata.category || "ND"}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder="Categoria..."
            disabled={timeEnded}
          />
        </div>

        {/* Esforço Estimado */}
        <div className="col-span-2">
          <label className="text-xs text-gray-600 mb-1 block">Esforço Estimado</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={editedMetadata.estimatedEffort === undefined ? "" : editedMetadata.estimatedEffort}
            onChange={(e) => {
              const value = e.target.value;
              handleEstimatedEffortChange(value);
            }}
            className="w-full text-xs p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            placeholder="Ex: 2"
            disabled={timeEnded}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleSaveMetadata}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            title="Salvar"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsEditingMetadata(false)}
            className="text-xs flex items-center gap-1 px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500"
            title="Cancelar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>);
}

export default CardMetadataEditorForm;