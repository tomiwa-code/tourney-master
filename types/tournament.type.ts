export type groupType = {
  [key: string]: string[];
};

export type DistributionMethod = "random" | "custom";

export type KnockoutStages = {
  roundOf32?: KnockoutMatch[];
  roundOf16: KnockoutMatch[];
  quarterFinals: KnockoutMatch[];
  semiFinals: KnockoutMatch[];
  finals: KnockoutMatch[];
};

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
  knockoutStages: KnockoutStages;
  knockoutDrawn: boolean;
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

export type CheckGroupStageCompletionRes = {
  allCompleted: boolean;
  incompleteGroups: string[];
  incompleteMatches: Array<{
    group: string;
    match: number;
    players: [string, string];
  }>;
};

export interface KnockoutMatch {
  id: string;
  round: string;
  home: string | null;
  away: string | null;
  homeScore?: ScoreType | null;
  awayScore?: ScoreType | null;
  winner?: string | null;
  completed: boolean;
}

export type ScoreType = (number | null)[];

export interface Qualifier {
  player: string;
  group: string;
  position: number;
  pts: number;
  gd: number;
  gf: number;
}

export type RoundsType =
  | "roundOf32"
  | "roundOf16"
  | "quarterFinals"
  | "semiFinals"
  | "finals";

export type KnockoutDataMatch = {
  id: string;
  homeScore?: ScoreType | null;
  awayScore?: ScoreType | null;
};

export type MatchResultsType = {
  [key: string]: {
    homeScore: ScoreType;
    awayScore: ScoreType;
  };
};

export type CreateTournamentFormDataType = {
  tournamentName: string;
  maxPlayers: string;
  playersPerGroup: string;
  playerNames: string;
  distribution: DistributionMethod;
  playerInput: string;
  qualifier: string;
  gameType: string;
};

export type EditNamesType = {
  [groupId: string]: { [idx: number]: { oldName: string; newName: string } }
};