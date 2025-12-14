import { MetadataType, VoteValue } from "@/types/global";

export const getButtonClass = (
  currentVote: VoteValue | undefined,
  voteType: VoteValue
) => {
  const baseClass =
    "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium";

  if (currentVote === voteType) {
    switch (voteType) {
      case "agree":
        return `${baseClass} bg-green-100 text-green-700 border-2 border-green-300 shadow-sm`;
      case "disagree":
        return `${baseClass} bg-red-100 text-red-700 border-2 border-red-300 shadow-sm`;
      case "neutral":
        return `${baseClass} bg-yellow-100 text-yellow-700 border-2 border-yellow-300 shadow-sm`;
    }
  }

  return `${baseClass} bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:border-gray-300`;
};

export const getTypeText = (type: MetadataType) => {
  switch (type) {
    case "priority":
      return "A prioridade";
    case "requirementType":
      return "O tipo de requisito";
    case "category":
      return "A categoria";
    case "estimatedEffort":
      return "O esforço estimado";
    default:
      return "";
  }
};

export const calculateVotes = (votes?: Record<string, VoteValue>) => {
  if (!votes || typeof votes !== "object") {
    return { agree: 0, disagree: 0, neutral: 0 };
  }

  const voteValues = Object.values(votes);

  const counts = voteValues.reduce(
    (acc, vote) => {
      if (vote === "agree") acc.agree++;
      else if (vote === "disagree") acc.disagree++;
      else if (vote === "neutral") acc.neutral++;
      return acc;
    },
    { agree: 0, disagree: 0, neutral: 0 }
  );

  return counts;
};
