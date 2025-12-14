import { Card } from "@/types/global";

export interface GamificationPoints {
  metadataVotes: {
    totalVotes: number;
    agreeVotes: number;
    correctPredictions?: number; // Se você quiser adicionar um sistema de previsão
  };
  cardRatings: {
    totalRatings: number;
    averageRating: number;
  };
  comments: {
    totalComments: number;
    helpfulComments?: number; // Se quiser avaliar qualidade de comentários
  };
}

export const calculateUserGamificationPoints = (
  cards: Card[],
  userId: string
): GamificationPoints => {
  let totalMetadataVotes = 0;
  let agreeMetadataVotes = 0;
  let totalCardRatings = 0;
  let sumCardRatings = 0;
  let totalComments = 0;

  cards.forEach((card) => {
    // Contar votos em metadados do usuário
    if (card.metadataVotes) {
      Object.values(card.metadataVotes).forEach((votes) => {
        if (votes && votes[userId]) {
          totalMetadataVotes++;
          if (votes[userId] === "agree") {
            agreeMetadataVotes++;
          }
        }
      });
    }

    // Contar ratings dados pelo usuário
    if (card.ratings && card.ratings[userId]) {
      totalCardRatings++;
      sumCardRatings += card.ratings[userId];
    }

    // Contar comentários do usuário
    if (card.comments) {
      totalComments += card.comments.filter(
        (comment: { createdById: string }) => comment.createdById === userId
      ).length;
    }
  });

  return {
    metadataVotes: {
      totalVotes: totalMetadataVotes,
      agreeVotes: agreeMetadataVotes,
    },
    cardRatings: {
      totalRatings: totalCardRatings,
      averageRating:
        totalCardRatings > 0 ? sumCardRatings / totalCardRatings : 0,
    },
    comments: {
      totalComments: totalComments,
    },
  };
};

// Função para calcular score total
export const calculateTotalScore = (points: GamificationPoints): number => {
  const metadataScore = points.metadataVotes.agreeVotes * 5; // 5 pontos por concordância
  const ratingScore = points.cardRatings.totalRatings * 2; // 2 pontos por avaliação
  const commentScore = points.comments.totalComments * 3; // 3 pontos por comentário

  return metadataScore + ratingScore + commentScore;
};
