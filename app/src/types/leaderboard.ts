import type { Card } from "./global";

export interface UserStats {
  userId: string;
  userName: string;
  totalComments: number;
  averageRating: number;
  totalReplies: number;
  totalCardsCreated: number;
}
export interface TeamMetrics {
  teamName: string;
  members: UserStats[];
  totalComments: number;
  totalCards: number;
  totalReplies: number;
  averageRating: number;
  totalMembers: number;
}

export interface UserContributions {
  user: UserStats;
  cardsCreated: Card[];
  comments: Array<{
    card: Card;
    comment: any;
  }>;
}

export type LeaderboardSortTypes = "comments" | "rating" | "replies" | "cards";

export type TabType = "participants" | "teams";
