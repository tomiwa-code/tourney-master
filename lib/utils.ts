import {
  CheckGroupStageCompletionRes,
  DistributionMethod,
  GroupFixtures,
  GroupStandings,
  KnockoutMatch,
  MatchFixture,
  PlayerMatchRecord,
  PlayerStats,
  Qualifier,
  TournamentDataType,
  UpdatedStandings,
} from "@/types/tournament.type";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const distributePlayersToGroups = (
  players: string[],
  playersPerGroup: number
) => {
  // Shuffle players first for random distribution
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  const groups: Record<string, string[]> = {};
  const groupCount = Math.ceil(players.length / playersPerGroup);

  for (let i = 0; i < groupCount; i++) {
    const groupName = String.fromCharCode(65 + i); // A, B, C, etc.
    const startIdx = i * playersPerGroup;
    const endIdx = startIdx + playersPerGroup;
    groups[groupName] = shuffledPlayers.slice(startIdx, endIdx);
  }

  return groups;
};

export const generateGroupFixtures = (
  groups: Record<string, string[]>
): GroupFixtures => {
  const fixtures: GroupFixtures = {};

  for (const [groupName, players] of Object.entries(groups)) {
    fixtures[groupName] = generateRoundRobinFixtures(players);
  }

  return fixtures;
};

const generateRoundRobinFixtures = (players: string[]): MatchFixture[] => {
  const fixtures: MatchFixture[] = [];
  const playerCount = players.length;
  const participants =
    playerCount % 2 === 0 ? [...players] : [...players, "BYE"];
  const half = participants.length / 2;
  const rounds = participants.length - 1;

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const homePlayer = participants[i];
      const awayPlayer = participants[participants.length - 1 - i];

      if (homePlayer !== "BYE" && awayPlayer !== "BYE") {
        fixtures.push({
          players: [homePlayer, awayPlayer],
          result: {
            homeScore: null,
            awayScore: null,
            completed: false,
          },
          round: round + 1,
        });
      }
    }
    participants.splice(1, 0, participants.pop()!);
  }

  return fixtures;
};

export const calculateDerivedStats = (player: PlayerStats): PlayerStats => {
  const mp = player.matches.length;
  const w = player.matches.filter(
    (m: PlayerMatchRecord) => m.points === 3
  ).length;
  const d = player.matches.filter(
    (m: PlayerMatchRecord) => m.points === 1
  ).length;
  const l = player.matches.filter(
    (m: PlayerMatchRecord) => m.points === 0
  ).length;
  const gf = player.matches.reduce(
    (sum: number, m: PlayerMatchRecord) => sum + m.goalsFor,
    0
  );
  const ga = player.matches.reduce(
    (sum: number, m: PlayerMatchRecord) => sum + m.goalsAgainst,
    0
  );

  return {
    ...player,
    mp,
    w,
    d,
    l,
    gf,
    ga,
    gd: gf - ga,
    pts: w * 3 + d * 1,
  };
};

export const initializeStandings = (
  groups: Record<string, string[]>
): GroupStandings => {
  const standings: GroupStandings = {};

  Object.entries(groups).forEach(([groupName, players]) => {
    standings[groupName] = players.map((player) => ({
      player,
      matches: [],
    }));
  });

  return standings;
};

export const updateMatchScore = (
  tournament: TournamentDataType,
  groupName: string,
  matchIndex: number,
  homeScore: number,
  awayScore: number
): TournamentDataType => {
  const updatedTournament = JSON.parse(JSON.stringify(tournament));
  const match = updatedTournament.groupFixtures[groupName][matchIndex];

  // 1. Remove previous result if exists
  if (match.result?.completed) {
    const removalResult = removeMatchRecords(
      updatedTournament.groupStandings,
      updatedTournament.groups,
      groupName,
      match.players,
      match.result.date
    );
    updatedTournament.groupStandings = removalResult.standings;
    updatedTournament.groups = removalResult.groups;
  }

  // 2. Update match result
  match.result = {
    homeScore,
    awayScore,
    completed: true,
    date: new Date().toISOString(),
  };

  // 3. Update standings and groups
  const { standings, groups } = addMatchResult(
    updatedTournament.groupStandings,
    groupName,
    updatedTournament.groups,
    match.players,
    [homeScore, awayScore],
    match.result.date
  );

  return {
    ...updatedTournament,
    groupStandings: standings,
    groups,
  };
};

// Helper functions
const addMatchResult = (
  standings: GroupStandings,
  groupName: string,
  groups: Record<string, string[]>,
  players: [string, string],
  scores: [number, number],
  date: string
): UpdatedStandings => {
  // 1. Deep copy with initialization
  const updatedStandings = JSON.parse(
    JSON.stringify(standings)
  ) as GroupStandings;
  const updatedGroups = JSON.parse(JSON.stringify(groups));

  // 2. Safety check
  if (!updatedStandings[groupName] || !updatedGroups[groupName]) {
    toast.error("Group not found in standings");
    return { standings, groups };
  }

  const [homePlayer, awayPlayer] = players;
  const [homeScore, awayScore] = scores;

  const homePoints =
    homeScore > awayScore ? 3 : homeScore === awayScore ? 1 : 0;
  const awayPoints =
    awayScore > homeScore ? 3 : awayScore === homeScore ? 1 : 0;

  // Add match to home player's history
  const homePlayerStats = updatedStandings[groupName].find(
    (p: PlayerStats) => p.player === homePlayer
  );
  if (homePlayerStats) {
    homePlayerStats.matches.push({
      opponent: awayPlayer,
      isHome: true,
      goalsFor: homeScore,
      goalsAgainst: awayScore,
      points: homePoints,
      date,
    });
  }

  // Add match to away player's history
  const awayPlayerStats = updatedStandings[groupName].find(
    (p: PlayerStats) => p.player === awayPlayer
  );
  if (awayPlayerStats) {
    awayPlayerStats.matches.push({
      opponent: homePlayer,
      isHome: false,
      goalsFor: awayScore,
      goalsAgainst: homeScore,
      points: awayPoints,
      date,
    });
  }

  // Recalculate all stats
  updatedStandings[groupName] = updatedStandings[groupName].map(
    (player: PlayerStats) => calculateDerivedStats(player)
  );

  // Sort standings
  updatedStandings[groupName].sort(
    (a: PlayerStats, b: PlayerStats) =>
      (b.pts ?? 0) - (a.pts ?? 0) ||
      (b.gd ?? 0) - (a.gd ?? 0) ||
      (b.gf ?? 0) - (a.gf ?? 0)
  );

  updatedGroups[groupName] = updatedStandings[groupName].map(
    (p: PlayerStats) => p.player
  );

  return {
    standings: updatedStandings,
    groups: updatedGroups,
  };
};

const removeMatchRecords = (
  standings: GroupStandings,
  groups: Record<string, string[]>,
  groupName: string,
  players: [string, string],
  date: string
): { standings: GroupStandings; groups: Record<string, string[]> } => {
  // 1. Deep copy with proper initialization
  const updatedStandings = JSON.parse(
    JSON.stringify(standings)
  ) as GroupStandings;
  const updatedGroups = JSON.parse(JSON.stringify(groups));

  // 2. Safety check
  if (!updatedStandings[groupName] || !updatedGroups[groupName]) {
    toast.error("Group not found in standings");
    return { standings, groups };
  }

  const [player1, player2] = players;

  // 3. Process updates
  updatedStandings[groupName] = updatedStandings[groupName]
    .map((player: PlayerStats) => {
      if (player.player === player1 || player.player === player2) {
        return {
          ...player,
          matches: player.matches.filter((m) => m.date !== date),
        };
      }
      return player;
    })
    .map(calculateDerivedStats);

  // 4. Sync groups with standings
  updatedGroups[groupName] = updatedStandings[groupName].map((p) => p.player);

  return {
    standings: updatedStandings,
    groups: updatedGroups,
  };
};

export const getTournamentData = (slug: string) => {
  const data = localStorage.getItem(`tourney-master-${slug}`);
  if (data) {
    return JSON.parse(data);
  }

  toast.error("Failed to load tournament data.");
};

export const distributePlayers = (
  allPlayers: string[],
  playersPerGroup: number,
  method: DistributionMethod = "random",
  customInput?: string
): Record<string, string[]> => {
  if (method === "custom" && customInput) {
    return parseCustomDistribution(customInput, playersPerGroup);
  }

  // For random distribution, validate total player count
  if (allPlayers.length % playersPerGroup !== 0) {
    throw new Error(
      `Total players (${allPlayers.length}) must be divisible by ${playersPerGroup}`
    );
  }

  return distributePlayersToGroups(allPlayers, playersPerGroup);
};

const parseCustomDistribution = (
  input: string,
  playersPerGroup: number
): Record<string, string[]> => {
  const groups: Record<string, string[]> = {};
  const groupStrings = input
    .split("*")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Validate each group has correct number of players
  for (let i = 0; i < groupStrings.length; i++) {
    const players = groupStrings[i]
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (players.length !== playersPerGroup) {
      throw new Error(
        `Group ${String.fromCharCode(
          65 + i
        )} should have exactly ${playersPerGroup} players, but has ${
          players.length
        }`
      );
    }
  }

  // Create groups if validation passed
  groupStrings.forEach((groupStr, index) => {
    const groupName = String.fromCharCode(65 + index); // A, B, C, etc.
    groups[groupName] = groupStr
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  });

  return groups;
};

export const getItemsStartingWith = <T = unknown>(
  prefix: string
): Record<string, T> => {
  const matchedItems: Record<string, T> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(prefix)) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          matchedItems[key] = JSON.parse(value) as T;
        } catch (err) {
          console.warn(`Failed to parse value for key "${key}": `, err);
        }
      }
    }
  }

  return matchedItems;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const sortByDate = <
  T extends { createdAt?: string; updatedAt?: string }
>(
  arr: T[],
  key: "createdAt" | "updatedAt"
): T[] => {
  return arr.slice().sort((a, b) => {
    const dateA = new Date(a[key] || "").getTime();
    const dateB = new Date(b[key] || "").getTime();

    return dateB - dateA;
  });
};

export const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "...";
};

export const checkGroupStageCompletion = (
  tournament: TournamentDataType
): CheckGroupStageCompletionRes => {
  const result = {
    allCompleted: true,
    incompleteGroups: [] as string[],
    incompleteMatches: [] as Array<{
      group: string;
      match: number;
      players: [string, string];
    }>,
  };

  Object.entries(tournament.groupFixtures).forEach(([groupName, fixtures]) => {
    fixtures.forEach((match, matchIndex) => {
      if (!match.result?.completed) {
        result.allCompleted = false;
        if (!result.incompleteGroups.includes(groupName)) {
          result.incompleteGroups.push(groupName);
        }
        result.incompleteMatches.push({
          group: groupName,
          match: matchIndex,
          players: match.players,
        });
      }
    });
  });

  return result;
};

export const validateTournamentSetup = (
  groupStandings: GroupStandings,
  qualifiersPerGroup: number
): { isValid: boolean; message?: string } => {
  const groupCount = Object.keys(groupStandings).length;
  const totalQualifiers = groupCount * qualifiersPerGroup;

  // Check if total qualifiers make a valid knockout bracket (16 or 32)
  if (totalQualifiers !== 16 && totalQualifiers !== 32) {
    return {
      isValid: false,
      message: `With ${groupCount} groups and ${qualifiersPerGroup} qualifiers per group, you get ${totalQualifiers} total qualifiers. 
      Knockout stages require exactly 16 or 32 teams. Please adjust your group/qualifier numbers.`,
    };
  }

  return { isValid: true };
};

export const drawKnockoutRound = (qualifiers: Qualifier[]): KnockoutMatch[] => {
  const totalQualifiers = qualifiers.length;
  const isRoundOf32 = totalQualifiers === 32;
  const roundName = isRoundOf32 ? "Round of 32" : "Round of 16";

  // Separate qualifiers by their position
  const groupWinners = qualifiers.filter((q) => q.position === 1);
  const runnersUp = qualifiers.filter((q) => q.position === 2);

  // Sort by performance (best to worst)
  const sortTeams = (teams: Qualifier[]) =>
    [...teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const sortedWinners = sortTeams(groupWinners);
  const sortedRunnersUp = sortTeams(runnersUp);

  const matches: KnockoutMatch[] = [];

  // Create working copies to avoid mutating the sorted arrays
  const availableWinners = [...sortedWinners];
  const availableRunnersUp = [...sortedRunnersUp].reverse(); // Reverse for easier indexing

  // Real-world Champions League drawing rules:
  // 1. Group winners (seeded) vs runners-up (unseeded)
  // 2. Teams from same group cannot face each other
  // 3. Random draw within constraints (no performance-based seeding)

  // Shuffle runners-up for random draw effect
  const shuffledRunnersUp = [...availableRunnersUp].sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < availableWinners.length; i++) {
    const homeTeam = availableWinners[i];

    // Find the first available runner-up that's not from the same group
    let awayTeamIndex = shuffledRunnersUp.findIndex(
      (runnerUp) => runnerUp && runnerUp.group !== homeTeam.group
    );

    // If no valid opponent found, something is wrong with the tournament setup
    if (awayTeamIndex === -1) {
      console.warn(
        `No valid opponent found for ${homeTeam.player} from group ${homeTeam.group}`
      );
      awayTeamIndex = 0; // Fallback to first available
    }

    const awayTeam = shuffledRunnersUp[awayTeamIndex];

    // Remove the selected runner-up from available pool
    shuffledRunnersUp.splice(awayTeamIndex, 1);

    matches.push({
      id: `${roundName.toLowerCase().replaceAll(" ", "-")}-${i + 1}`,
      round: roundName,
      home: homeTeam.player,
      away: awayTeam.player,
      homeScore: null,
      awayScore: null,
      completed: false,
    });
  }

  return matches;
};

export const getQualifiers = (
  groupStandings: GroupStandings,
  qualifiersPerGroup: number
): Qualifier[] => {
  return Object.entries(groupStandings).flatMap(([group, players]) =>
    players
      .sort(
        (a, b) =>
          (b.pts ?? 0) - (a.pts ?? 0) ||
          (b.gd ?? 0) - (a.gd ?? 0) ||
          (b.gf ?? 0) - (a.gf ?? 0)
      )
      .slice(0, qualifiersPerGroup)
      .map((player, index) => ({
        player: player.player,
        group,
        position: index + 1,
        pts: player.pts ?? 0,
        gd: player.gd ?? 0,
        gf: player.gf ?? 0,
      }))
  );
};
