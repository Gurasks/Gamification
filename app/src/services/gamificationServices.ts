import { Card, MetadataType, VoteValue } from "@/types/global";

export const METADATA_AGREE_90_WEIGHT = 5;
export const METADATA_AGREE_70_WEIGHT = 3;
export const METADATA_AGREE_50_WEIGHT = 1;
export const RATING_4_WEIGHT = 5;
export const RATING_3_WEIGHT = 3;

export interface GamificationPoints {
  metadataVotes: {
    totalVotes: number;
    agreeVotes: number;
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

const calculateMetadataVoteScore = (
  votes: Record<string, VoteValue>,
  cardOwnerId: string
): number => {
  let score = 0;

  Object.entries(votes).forEach(([voterId, vote]) => {
    if (voterId === cardOwnerId) return;

    if (vote === "agree") score += 1;
    if (vote === "disagree") score -= 1;
  });

  return score;
};

export const calculateUserGamificationPoints = (
  cards: Card[],
  userId: string
): GamificationPoints => {
  let metadataScore = 0;
  let totalMetadataVotes = 0;
  let totalCardRatings = 0;
  let sumCardRatings = 0;
  let totalComments = 0;

  cards.forEach((card) => {
    if (card.createdById !== userId) return;

    if (card.metadataVotes) {
      const metadataTypes: MetadataType[] = [
        "priority",
        "requirementType",
        "category",
        "estimatedEffort",
      ];

      metadataTypes.forEach((type) => {
        const votes = card.metadataVotes?.[type];
        if (!votes) return;

        Object.keys(votes).forEach((voterId) => {
          if (voterId !== userId) {
            totalMetadataVotes++;
          }
        });

        metadataScore += calculateMetadataVoteScore(votes, userId);
      });
    }

    if (card.ratings) {
      Object.entries(card.ratings).forEach(([raterId, rating]) => {
        if (raterId !== userId) {
          totalCardRatings++;
          sumCardRatings += rating;
        }
      });
    }
  });

  cards.forEach((card) => {
    if (card.createdById === userId) return;

    if (card.comments) {
      totalComments += card.comments.filter(
        (comment) => comment.createdById === userId
      ).length;
    }
  });

  return {
    metadataVotes: {
      totalVotes: totalMetadataVotes,
      agreeVotes: metadataScore,
    },
    cardRatings: {
      totalRatings: totalCardRatings,
      averageRating:
        totalCardRatings > 0 ? sumCardRatings / totalCardRatings : 0,
    },
    comments: {
      totalComments,
    },
  };
};

const _calculateCardRatingsScore = (ratings: {
  totalRatings: number;
  averageRating: number;
}): number => {
  if (ratings.averageRating >= 4) return ratings.totalRatings * RATING_4_WEIGHT;
  if (ratings.averageRating >= 3) return ratings.totalRatings * RATING_3_WEIGHT;
  return 0;
};

const _calculateMetadataScore = (metadata: {
  totalVotes: number;
  agreeVotes: number;
}): number => {
  const metadataAgreementRate =
    metadata.totalVotes === 0 ? 0 : metadata.agreeVotes / metadata.totalVotes;
  if (metadataAgreementRate >= 0.9)
    return metadata.agreeVotes * METADATA_AGREE_90_WEIGHT;
  if (metadataAgreementRate >= 0.7)
    return metadata.agreeVotes * METADATA_AGREE_70_WEIGHT;
  if (metadataAgreementRate >= 0.5)
    return metadata.agreeVotes * METADATA_AGREE_50_WEIGHT;
  return 0;
};

export const calculateTotalScore = (points: GamificationPoints): number => {
  const metadataScore = _calculateMetadataScore(points.metadataVotes);
  const ratingScore = _calculateCardRatingsScore(points.cardRatings);
  const commentScore = points.comments.totalComments;

  return metadataScore + ratingScore + commentScore;
};
