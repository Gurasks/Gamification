import type { SelectionMethod } from "./teamSelection";

export interface PersistentUser {
  id: string;
  name: string;
}

export interface Refinement {
  id: string;
  createdAt: Date;
  members: string[];
  numOfTeams: number;
  owner: string;
  selectionMethod: SelectionMethod;
  teams: Record<string, string>;
  title: string;
  hasStarted?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdById: string;
  createdAt: Date;
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
  createdAt: Date;
  comments?: Comment[];
}
