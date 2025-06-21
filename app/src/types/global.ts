import type { Timestamp } from "firebase/firestore";
import type { SelectionMethod } from "./teamSelection";

export interface PersistentUser {
  id: string;
  name: string;
}

export interface Refinement {
  id: string;
  createdAt: Timestamp;
  members: PersistentUser[];
  numOfTeams: number;
  owner: string;
  selectionMethod: SelectionMethod;
  teams: Record<string, string>;
  title: string;
  hasStarted: boolean;
  startTime?: Timestamp;
  timerMinutes?: number;
  timerSeconds?: number;
  updatedAt?: Timestamp;
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
  refinementId: string;
  teamName: string;
  createdBy: string;
  createdById: string;
  ratings: Record<string, number>;
  createdAt: Timestamp;
  comments?: Comment[];
  updatedAt?: Timestamp;
}

export interface TimerInfo {
  minutes: number;
  seconds: number;
}
