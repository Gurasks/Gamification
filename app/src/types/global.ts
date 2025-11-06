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

export interface Card {
  id: string;
  text: string;
  columnId: string;
  sessionId: string;
  teamName: string;
  createdBy: string;
  createdById: string;
  ratings: Record<string, number>;
  createdAt: Timestamp;
  comments?: Comment[];
  updatedAt?: Timestamp;
}
