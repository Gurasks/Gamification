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

export interface CardMetadata {
  priority?: PriorityLevel;
  requirementType?: RequirementType;
  category?: CategoryType;
  estimatedEffort?: number;
  tags?: string[];
}

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
