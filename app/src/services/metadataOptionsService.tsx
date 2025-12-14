import {
  PriorityLevel,
  RequirementType,
  CategoryType
} from '@/types/global';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpCircle,
  AlertOctagon,
  Zap,
  BarChart3,
  Wrench as WrenchIcon,
  Palette,
  FileText,
  Sparkles,
  Wrench,
  Bug,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Layers,
  AlertCircle,
  Clock
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface MetadataOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const priorityOptions: MetadataOption<PriorityLevel>[] = [
  {
    value: 'baixa',
    label: 'Baixa',
    icon: <ArrowDown className="w-4 h-4 text-green-500" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    value: 'media',
    label: 'Média',
    icon: <ArrowUp className="w-4 h-4 text-yellow-500" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    value: 'alta',
    label: 'Alta',
    icon: <ArrowUpCircle className="w-4 h-4 text-orange-500" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    value: 'critica',
    label: 'Crítica',
    icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
];

export const getPriorityOption = (value: PriorityLevel): MetadataOption<PriorityLevel> | undefined => {
  return priorityOptions.find(option => option.value === value);
};

export const requirementTypeOptions: MetadataOption<RequirementType>[] = [
  {
    value: 'funcional',
    label: 'Funcional',
    icon: <Zap className="w-4 h-4 text-blue-500" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    value: 'nao-funcional',
    label: 'Não Funcional',
    icon: <BarChart3 className="w-4 h-4 text-purple-500" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    value: 'tecnico',
    label: 'Técnico',
    icon: <WrenchIcon className="w-4 h-4 text-gray-600" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  {
    value: 'design',
    label: 'Design',
    icon: <Palette className="w-4 h-4 text-pink-500" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  {
    value: 'outro',
    label: 'Outro',
    icon: <FileText className="w-4 h-4 text-gray-500" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
];

export const getRequirementTypeOption = (value: RequirementType): MetadataOption<RequirementType> | undefined => {
  return requirementTypeOptions.find(option => option.value === value);
};

export const categoryOptions: MetadataOption<CategoryType>[] = [
  {
    value: 'feature',
    label: 'Nova Feature',
    icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    value: 'melhoria',
    label: 'Melhoria',
    icon: <Wrench className="w-4 h-4 text-blue-500" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    value: 'bug',
    label: 'Bug',
    icon: <Bug className="w-4 h-4 text-red-500" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    value: 'documentacao',
    label: 'Documentação',
    icon: <BookOpen className="w-4 h-4 text-green-500" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    value: 'pergunta',
    label: 'Pergunta',
    icon: <HelpCircle className="w-4 h-4 text-yellow-500" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    value: 'feedback',
    label: 'Feedback',
    icon: <MessageSquare className="w-4 h-4 text-indigo-500" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
];

export const getCategoryOption = (value: CategoryType): MetadataOption<CategoryType> | undefined => {
  return categoryOptions.find(option => option.value === value);
};

export const metadataIcons = {
  priority: <ArrowUp className="w-4 h-4" />,
  category: <Layers className="w-4 h-4" />,
  requirementType: <BarChart3 className="w-4 h-4" />,
  effort: <Clock className="w-4 h-4" />,
  filter: <AlertCircle className="w-4 h-4" />,
  metadata: <Layers className="w-4 h-4" />
};

export const getAllPriorityValues = (): PriorityLevel[] => {
  return priorityOptions.map(option => option.value);
};

export const getAllCategoryValues = (): CategoryType[] => {
  return categoryOptions.map(option => option.value);
};

export const getAllRequirementTypeValues = (): RequirementType[] => {
  return requirementTypeOptions.map(option => option.value);
};

export const renderMetadataBadge = (
  type: 'priority' | 'category' | 'requirementType',
  value: string
): ReactNode => {
  let option: MetadataOption<any> | undefined;

  switch (type) {
    case 'priority':
      option = getPriorityOption(value as PriorityLevel);
      break;
    case 'category':
      option = getCategoryOption(value as CategoryType);
      break;
    case 'requirementType':
      option = getRequirementTypeOption(value as RequirementType);
      break;
  }

  if (!option) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${option.bgColor} ${option.color} border ${option.borderColor}`}>
      {option.icon}
      <span>{option.label}</span>
    </span>
  );
};

export const getCustomDropdownOptions = {
  priority: priorityOptions.map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    color: option.color.replace('text-', '')
  })),
  requirementType: requirementTypeOptions.map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    color: option.color.replace('text-', '')
  })),
  category: categoryOptions.map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    color: option.color.replace('text-', '')
  }))
};

export const getCorrectOptionText = (text: string): string => {
  if (text.length === 0) return text;
  if (text === "nao-funcional") return "Não Funcional";
  if (text === "documentacao") return "Documentação";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const metadataService = {
  priorityOptions,
  categoryOptions,
  requirementTypeOptions,
  metadataIcons,
  getPriorityOption,
  getCategoryOption,
  getRequirementTypeOption,
  getAllPriorityValues,
  getAllCategoryValues,
  getAllRequirementTypeValues,
  renderMetadataBadge,
  getCustomDropdownOptions,
  getCorrectOptionText
};

export default metadataService;