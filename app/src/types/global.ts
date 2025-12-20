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

export type PriorityLevel = "baixa" | "media" | "alta" | "critica";
export type RequirementType =
  | "funcional"
  | "nao-funcional"
  | "tecnico"
  | "design"
  | "outro";
export type CategoryType =
  | "melhoria"
  | "bug"
  | "feature"
  | "documentacao"
  | "pergunta"
  | "feedback";

export type MetadataType =
  | "priority"
  | "requirementType"
  | "category"
  | "estimatedEffort";

export type VoteValue = "agree" | "disagree" | "neutral";

export interface MetadataVote {
  userId: string;
  vote: VoteValue;
  timestamp: Timestamp;
  displayName?: string;
}

export interface CardMetadataVotes {
  priority?: Record<string, VoteValue>;
  requirementType?: Record<string, VoteValue>;
  category?: Record<string, VoteValue>;
  estimatedEffort?: Record<string, VoteValue>;
}
export interface VoteCounts {
  agree: number;
  disagree: number;
  neutral: number;
}
