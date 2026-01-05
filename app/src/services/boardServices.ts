import { SortOption } from "@/scenes/BoardScene/components/CardSorteningSelector";
import { Card, Session } from "@/types/global";
import { PASTEL_BG_CLASSES } from "@/utils/stringToPastelBg";
import { calculateAverageRating } from "./globalServices";

export const getAdditionalTimeDisplay = (additionalTime: number) => {
  return additionalTime > 1 ? "s" : "";
};

export const getSortedCards = (
  cards: Card[],
  sortOption: SortOption
): Card[] => {
  const sortedCards = [...cards];

  switch (sortOption) {
    case "newest":
      return sortedCards.sort((a, b) => {
        const dateA = a.createdAt
          ? typeof a.createdAt === "object" && "toMillis" in a.createdAt
            ? a.createdAt.toMillis()
            : new Date(a.createdAt).getTime()
          : 0;
        const dateB = b.createdAt
          ? typeof b.createdAt === "object" && "toMillis" in b.createdAt
            ? b.createdAt.toMillis()
            : new Date(b.createdAt).getTime()
          : 0;
        return dateB - dateA; // Mais recentes primeiro
      });

    case "oldest":
      return sortedCards.sort((a, b) => {
        const dateA = a.createdAt
          ? typeof a.createdAt === "object" && "toMillis" in a.createdAt
            ? a.createdAt.toMillis()
            : new Date(a.createdAt).getTime()
          : 0;
        const dateB = b.createdAt
          ? typeof b.createdAt === "object" && "toMillis" in b.createdAt
            ? b.createdAt.toMillis()
            : new Date(b.createdAt).getTime()
          : 0;
        return dateA - dateB; // Mais antigos primeiro
      });

    case "highest": {
      return sortedCards.sort((a, b) => {
        const ratingA = calculateAverageRating(a.ratings);
        const ratingB = calculateAverageRating(b.ratings);
        return ratingB - ratingA; // Maior rating primeiro
      });
    }

    case "lowest": {
      return sortedCards.sort((a, b) => {
        const ratingA = calculateAverageRating(a.ratings);
        const ratingB = calculateAverageRating(b.ratings);
        return ratingA - ratingB; // Menor rating primeiro
      });
    }

    case "mostComments":
      return sortedCards.sort((a, b) => {
        const commentsA = a.comments?.length || 0;
        const commentsB = b.comments?.length || 0;
        return commentsB - commentsA; // Mais comentários primeiro
      });

    case "leastComments":
      return sortedCards.sort((a, b) => {
        const commentsA = a.comments?.length || 0;
        const commentsB = b.comments?.length || 0;
        return commentsA - commentsB; // Menos comentários primeiro
      });
    case "author":
      return sortedCards.sort((a, b) => {
        const authorA = a.createdBy?.toLowerCase() || "";
        const authorB = b.createdBy?.toLowerCase() || "";
        if (authorA < authorB) return -1;
        if (authorA > authorB) return 1;
        return 0;
      });

    default:
      return sortedCards;
  }
};

export function stringToPastelBg(value: string | undefined | null): string {
  const str = value?.trim();
  if (!str) {
    return "bg-slate-50";
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.trunc(hash * 31 + (str.codePointAt(i) || 0));
  }

  const index = Math.abs(hash) % PASTEL_BG_CLASSES.length;
  return PASTEL_BG_CLASSES[index];
}

export const calculateTeamStats = (session: Session, cards: Card[]) => {
  if (!session.teams || cards.length === 0) return [];

  const allTeams = Object.values(session.teams);
  const uniqueTeams = [...new Set(allTeams)];

  return uniqueTeams.map((teamName) => {
    const teamCards = cards.filter((card) => card.teamName === teamName);

    return {
      name: teamName,
      cardCount: teamCards.length,
    };
  });
};
