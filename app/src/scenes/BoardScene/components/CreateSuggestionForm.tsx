import React, { FormEvent } from 'react';
import VariableTextArea from '@/components/VariableTextArea';
import { MetadataSelectors } from '@/components/MetadataSelectors';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type {
  PriorityLevel,
  RequirementType,
  CategoryType,
  CardMetadata
} from '@/types/global';

interface CreateSuggestionFormProps {
  text: string;
  setText: (value: string) => void;

  priority: PriorityLevel | '';
  setPriority: (v: PriorityLevel | '') => void;

  requirementType: RequirementType | '';
  setRequirementType: (v: RequirementType | '') => void;

  category: CategoryType | '';
  setCategory: (v: CategoryType | '') => void;

  estimatedEffort: number | '';
  setEstimatedEffort: (v: number | '') => void;

  onSubmit: (metadata: CardMetadata) => Promise<void>;
  isSubmitting: boolean;
}

const CreateSuggestionForm: React.FC<CreateSuggestionFormProps> = ({
  text,
  setText,
  priority,
  setPriority,
  requirementType,
  setRequirementType,
  category,
  setCategory,
  estimatedEffort,
  setEstimatedEffort,
  onSubmit,
  isSubmitting
}) => {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    const metadata: CardMetadata = {};
    if (priority) metadata.priority = priority;
    if (requirementType) metadata.requirementType = requirementType;
    if (category) metadata.category = category;
    if (estimatedEffort !== '') metadata.estimatedEffort = estimatedEffort;

    await onSubmit(metadata);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <VariableTextArea
        text={text}
        setText={setText}
        disabled={isSubmitting}
        placeholder={isSubmitting ? 'Criando sugestão...' : 'Digite sua sugestão...'}
        rows={2}
        showSubmitButton={false}
        submitFormOnEnter={true}
      />
      <MetadataSelectors
        priority={priority}
        setPriority={setPriority}
        requirementType={requirementType}
        setRequirementType={setRequirementType}
        category={category}
        setCategory={setCategory}
        estimatedEffort={estimatedEffort}
        setEstimatedEffort={setEstimatedEffort}
        disabled={isSubmitting}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !text.trim()}
          className="flex items-center gap-2"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          Enviar sugestão
        </Button>
      </div>
    </form>
  );
};

export default CreateSuggestionForm;