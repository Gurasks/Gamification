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
}

export type SelectionMethod =
  | 'RANDOM'
  | 'CHOOSE_YOUR_TEAM'
  | 'OWNER_CHOOSES';