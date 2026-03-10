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
import { TFunction } from 'i18next';

export interface MetadataOption<T extends string> {
  value: T;
  label: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const getPriorityOptions = (t: TFunction): MetadataOption<PriorityLevel>[] => [
  {
    value: 'low',
    label: t('metadata.priority.low'),
    icon: <ArrowDown className="w-4 h-4 text-green-500" />,
    color: 'green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    value: 'medium',
    label: t('metadata.priority.medium'),
    icon: <ArrowUp className="w-4 h-4 text-yellow-500" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    value: 'high',
    label: t('metadata.priority.high'),
    icon: <ArrowUpCircle className="w-4 h-4 text-orange-500" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    value: 'critical',
    label: t('metadata.priority.critical'),
    icon: <AlertOctagon className="w-4 h-4 text-red-500" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
];

export const getRequirementTypeOptions = (t: TFunction): MetadataOption<RequirementType>[] => [
  {
    value: 'functional',
    label: t('metadata.requirementType.functional'),
    icon: <Zap className="w-4 h-4 text-blue-500" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    value: 'nonFunctional',
    label: t('metadata.requirementType.nonFunctional'),
    icon: <BarChart3 className="w-4 h-4 text-purple-500" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    value: 'technical',
    label: t('metadata.requirementType.technical'),
    icon: <WrenchIcon className="w-4 h-4 text-gray-600" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  {
    value: 'design',
    label: t('metadata.requirementType.design'),
    icon: <Palette className="w-4 h-4 text-pink-500" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  },
  {
    value: 'other',
    label: t('metadata.requirementType.other'),
    icon: <FileText className="w-4 h-4 text-gray-500" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
];

export const getCategoryOptions = (t: TFunction): MetadataOption<CategoryType>[] => [
  {
    value: 'feature',
    label: t('metadata.category.feature'),
    icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    value: 'improvement',
    label: t('metadata.category.improvement'),
    icon: <Wrench className="w-4 h-4 text-blue-500" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    value: 'bug',
    label: t('metadata.category.bug'),
    icon: <Bug className="w-4 h-4 text-red-500" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    value: 'documentation',
    label: t('metadata.category.documentation'),
    icon: <BookOpen className="w-4 h-4 text-green-500" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    value: 'question',
    label: t('metadata.category.question'),
    icon: <HelpCircle className="w-4 h-4 text-yellow-500" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    value: 'feedback',
    label: t('metadata.category.feedback'),
    icon: <MessageSquare className="w-4 h-4 text-indigo-500" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
];

export const getPriorityOption = (value: PriorityLevel, t: TFunction): MetadataOption<PriorityLevel> | undefined => {
  return getPriorityOptions(t).find(option => option.value === value);
};

export const getRequirementTypeOption = (value: RequirementType, t: TFunction): MetadataOption<RequirementType> | undefined => {
  return getRequirementTypeOptions(t).find(option => option.value === value);
};

export const getCategoryOption = (value: CategoryType, t: TFunction): MetadataOption<CategoryType> | undefined => {
  return getCategoryOptions(t).find(option => option.value === value);
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
  return ['low', 'medium', 'high', 'critical'];
};

export const getAllCategoryValues = (): CategoryType[] => {
  return ['feature', 'improvement', 'bug', 'documentation', 'question', 'feedback'];
};

export const getAllRequirementTypeValues = (): RequirementType[] => {
  return ['functional', 'nonFunctional', 'technical', 'design', 'other'];
};

export const renderMetadataBadge = (
  type: 'priority' | 'category' | 'requirementType',
  value: string,
  t: TFunction
): ReactNode => {
  let option: MetadataOption<any> | undefined;

  switch (type) {
    case 'priority':
      option = getPriorityOption(value as PriorityLevel, t);
      break;
    case 'category':
      option = getCategoryOption(value as CategoryType, t);
      break;
    case 'requirementType':
      option = getRequirementTypeOption(value as RequirementType, t);
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

export const getCustomDropdownOptions = (t: TFunction) => ({
  priority: getPriorityOptions(t).map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    color: option.color.replace('text-', '')
  })),
  requirementType: getRequirementTypeOptions(t).map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    color: option.color.replace('text-', '')
  })),
  category: getCategoryOptions(t).map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
    color: option.color.replace('text-', '')
  }))
});
