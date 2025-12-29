import { Card, MetadataType, TeamTimer, VoteValue } from "@/types/global";
import { TeamTimeData } from "@/types/leaderboard";

export const METADATA_AGREE_90_WEIGHT = 5;
export const METADATA_AGREE_70_WEIGHT = 3;
export const METADATA_AGREE_50_WEIGHT = 1;
export const RATING_4_WEIGHT = 5;
export const RATING_3_WEIGHT = 3;
export const TIME_MULTIPLIER_BASE = 1.0;
export const TIME_BONUS_MAX = 15;
export const TIME_PENALTY_MAX = -15;

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
    helpfulComments?: number;
  };
  timeEfficiency: {
    teamTimeUsage: number;
    minTeamTime: number;
    bonusPoints: number;
    efficiencyScore: number;
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
  userId: string,
  teamName?: string,
  teamTimeData?: TeamTimeData[]
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

  let timeEfficiency = {
    teamTimeUsage: 0,
    minTeamTime: 0,
    bonusPoints: 0,
    efficiencyScore: 0,
  };

  if (teamName && teamTimeData && teamTimeData.length > 0) {
    const userTeam = teamTimeData.find((t) => t.teamName === teamName);
    if (userTeam) {
      const minTime = Math.min(...teamTimeData.map((t) => t.totalTime));
      const teamCards = cards.filter((c) => c.teamName === teamName);

      const bonusPoints = calculateTimeEfficiencyScore(
        userTeam.totalTime,
        minTime,
        teamCards.length
      );

      timeEfficiency = {
        teamTimeUsage: userTeam.totalTime,
        minTeamTime: minTime,
        bonusPoints,
        efficiencyScore: userTeam.efficiency,
      };
    }
  }

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
    timeEfficiency,
  };
};

export const calculateTimeEfficiencyScore = (
  teamTime: number,
  minTime: number,
  totalCards: number
): number => {
  if (totalCards === 0) return 0;

  if (minTime === 0) minTime = 1;
  let bonusPoints = 0;

  if (teamTime === minTime) {
    bonusPoints = TIME_BONUS_MAX;
  } else if (teamTime > minTime * 2) {
    bonusPoints = TIME_PENALTY_MAX;
  } else {
    const timeRatio = minTime / teamTime;
    bonusPoints = Math.round(
      TIME_BONUS_MAX * timeRatio + TIME_PENALTY_MAX * (1 - timeRatio)
    );

    bonusPoints = Math.max(
      TIME_PENALTY_MAX,
      Math.min(TIME_BONUS_MAX, bonusPoints)
    );
  }

  const cardsMultiplier = Math.min(2, totalCards / 5);
  bonusPoints = Math.round(bonusPoints * cardsMultiplier);

  return bonusPoints;
};

export const calculateTeamTimes = (
  cards: Card[],
  teamTimers: Record<string, TeamTimer>
): TeamTimeData[] => {
  if (!cards.length) return [];

  // 1. Agrupar cards por time
  const cardsByTeam: Record<string, Card[]> = {};
  cards.forEach((card) => {
    if (!cardsByTeam[card.teamName]) {
      cardsByTeam[card.teamName] = [];
    }
    cardsByTeam[card.teamName].push(card);
  });

  // 2. Montar estrutura intermediária com médias
  const teamTimesTemp: Array<TeamTimeData & { averageTimePerCard: number }> =
    [];

  Object.entries(cardsByTeam).forEach(([teamName, teamCards]) => {
    const teamTotalTime = teamTimers[teamName]?.totalDuration;

    if (!teamTotalTime || teamCards.length === 0) return;

    const averageTimePerCard = teamTotalTime / teamCards.length;

    teamTimesTemp.push({
      teamName,
      totalTime: teamTotalTime,
      averageTimePerCard,
      efficiency: 0, // calculado depois
    });
  });

  if (!teamTimesTemp.length) return [];

  // 3. Encontrar o menor averageTimePerCard
  const minAverageTimePerCard = Math.min(
    ...teamTimesTemp.map((t) => t.averageTimePerCard)
  );

  // 4. Calcular eficiência (%)
  return teamTimesTemp.map((team) => ({
    ...team,
    efficiency: (minAverageTimePerCard / team.averageTimePerCard) * 100,
  }));
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
  const timeBonus = points.timeEfficiency?.bonusPoints || 0;

  return metadataScore + ratingScore + commentScore + timeBonus;
};
