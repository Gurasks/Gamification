import type { Timestamp } from "firebase/firestore";
import type { SelectionMethod } from "./teamSelection";

export interface UserData {
  uid: string;
  displayName: string;
  email: string;
  isAnonymous: boolean;
}

export interface Session {
  id: string;
  createdAt: Timestamp;
  members: UserData[];
  numOfTeams: number;
  owner: string;
  selectionMethod: SelectionMethod;
  teams: Record<string, string>;
  title: string;
  description: string;
  password: string | null;
  requiresPassword: boolean;
  hasStarted: boolean;
  startTime?: Timestamp;
  updatedAt?: Timestamp;
  teamTimers?: Record<string, string>;
  isClosed?: boolean;
  timersReady?: boolean;
}

export interface SessionCreationData {
  name: string;
  description?: string;
  password?: string | null;
  requiresPassword?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdById: string;
  createdAt: Timestamp;
}

export interface Metadata {
  priority?: PriorityLevel;
  requirementType?: RequirementType;
  category?: CategoryType;
  estimatedEffort?: number;
}

export type CardMetadata = Metadata & {
  metadataVotes?: CardMetadataVotes;
};

export interface BaseCardData {
  text: string;
  sessionId: string;
  createdBy: string;
  createdById: string;
  teamName: string;
  createdAt: Timestamp;
}

export type CardData = BaseCardData & CardMetadata;

export interface Card extends BaseCardData, CardMetadata {
  id: string;
  columnId: string;
  ratings: Record<string, number>;
  comments?: Comment[];
  updatedAt?: Timestamp;
}

export type PriorityLevel = "low" | "medium" | "high" | "critical";
export type RequirementType =
  | "functional"
  | "nonFunctional"
  | "technical"
  | "design"
  | "other";
export type CategoryType =
  | "improvement"
  | "bug"
  | "feature"
  | "documentation"
  | "question"
  | "feedback";

export type MetadataType =
  | "priority"
  | "requirementType"
  | "category"
  | "estimatedEffort";

export type VoteValue = "agree" | "disagree" | "neutral";

export interface CardMetadataVotes {
  priority?: Record<string, VoteValue>;
  requirementType?: Record<string, VoteValue>;
  category?: Record<string, VoteValue>;
  estimatedEffort?: Record<string, VoteValue>;
}

export interface TeamTimer {
  id: string;
  duration: number;
  totalDuration?: number;
  isRunning: boolean;
  startTime: Timestamp;
  lastUpdated?: Timestamp;
}
