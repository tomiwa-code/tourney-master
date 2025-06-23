export type groupType = {
  A: string[];
  B: string[];
  C: string[];
  D: string[];
};

export type DistributionMethod = "random" | "custom";

export type TournamentDataType = {
  slug: string;
  name: string;
  numOfQualifier: number;
  groups: groupType;
  groupFixtures: GroupFixtures;
  groupStandings: GroupStandings;
  distribution: DistributionMethod;
  status: "group-stage" | "knockout" | "completed";
  playersPerGroup: string;
  totalPlayer: string;
  createdAt: string;
  updatedAt: string;
};

// Add these types
export type PlayerMatchRecord = {
  opponent: string;
  isHome: boolean;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  date: string;
};

export type PlayerStats = {
  player: string;
  matches: PlayerMatchRecord[];
  // These will be calculated when needed
  mp?: number;
  w?: number;
  d?: number;
  l?: number;
  gf?: number;
  ga?: number;
  gd?: number;
  pts?: number;
};

export type MatchResult = {
  homeScore: number | null;
  awayScore: number | null;
  completed: boolean;
};

export type MatchFixture = {
  players: [string, string]; // [homePlayer, awayPlayer]
  result: MatchResult;
  round?: number; // Useful for tracking group stage rounds
};

export type GroupStandings = Record<string, PlayerStats[]>;
export type GroupFixtures = Record<string, MatchFixture[]>;
export interface UpdatedStandings {
  standings: GroupStandings;
  groups: Record<string, string[]>;
}

export type TournamentListType = Record<string, TournamentDataType>;
