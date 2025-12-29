import { GamificationPoints } from "@/services/gamificationServices";
import type { Card } from "./global";

export interface UserStats {
  userId: string;
  userName: string;
  totalComments: number;
  averageRating: number;
  totalReplies: number;
  totalCardsCreated: number;
  totalScore?: number;
  gamificationPoints?: GamificationPoints;
}
export interface TeamMetrics {
  teamName: string;
  members: UserStats[];
  totalComments: number;
  totalCards: number;
  totalReplies: number;
  averageRating: number;
  totalMembers: number;
  totalScore?: number;
}

export interface UserContributions {
  user: UserStats;
  cardsCreated: Card[];
  comments: Array<{
    card: Card;
    comment: any;
  }>;
}

export type LeaderboardSortTypes =
  | "score"
  | "comments"
  | "rating"
  | "replies"
  | "cards";

export type TabType = "participants" | "teams";

export interface TeamTimeData {
  teamName: string;
  totalTime: number;
  averageTimePerCard?: number;
  efficiency: number;
}
