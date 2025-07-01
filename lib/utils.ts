import {
  CheckGroupStageCompletionRes,
  DistributionMethod,
  EditNamesType,
  GroupFixtures,
  GroupStandings,
  groupType,
  KnockoutMatch,
  MatchFixture,
  PlayerMatchRecord,
  PlayerStats,
  Qualifier,
  RoundsType,
  TournamentDataType,
  UpdatedStandings,
} from "@/types/tournament.type";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const splitPlayerNames = (input: string) => {
  const playerNamesArray = input
    .split(/\s+/) // splits on spaces, tabs, newlines
    .map((name) => name.trim())
    .filter((name) => name); // remove empty strings

  return playerNamesArray;
};

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
    const players = splitPlayerNames(groupStrings[i]);

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
      .replaceAll(/\s+/g, ", ")
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  });

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
  homeScore: number | null,
  awayScore: number | null
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
  scores: [number | null, number | null],
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

  const bothScoreValid = homeScore !== null && awayScore !== null;

  const homePoints =
    bothScoreValid && homeScore > awayScore
      ? 3
      : homeScore === awayScore
      ? 1
      : 0;
  const awayPoints =
    bothScoreValid && awayScore > homeScore
      ? 3
      : awayScore === homeScore
      ? 1
      : 0;

  // Add match to home player's history
  const homePlayerStats = updatedStandings[groupName].find(
    (p: PlayerStats) => p.player === homePlayer
  );
  if (homePlayerStats && bothScoreValid) {
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
  if (awayPlayerStats && bothScoreValid) {
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
  if (
    totalQualifiers !== 16 &&
    totalQualifiers !== 32 &&
    totalQualifiers !== 8 &&
    totalQualifiers !== 4
  ) {
    return {
      isValid: false,
      message: `With ${groupCount} groups and ${qualifiersPerGroup} qualifiers per group, you get ${totalQualifiers} total qualifiers. 
      Knockout stages require exactly 32, 16, 8, or 4 teams. Please adjust your group/qualifier numbers.`,
    };
  }

  return { isValid: true };
};

export const drawKnockoutRound = (
  qualifiers: Qualifier[],
  qualifiersPerGroup: number
): KnockoutMatch[] => {
  const totalQualifiers = qualifiers.length;

  // Validate qualifiers count is a power of two
  if (!isPowerOfTwo(totalQualifiers) || totalQualifiers < 4) {
    throw new Error(
      `Invalid qualifier count: ${totalQualifiers}. Must be a power of two (4, 8, 16, 32, etc.)`
    );
  }

  let roundKey: RoundsType;
  switch (qualifiers.length) {
    case 32:
      roundKey = "roundOf32";
      break;
    case 16:
      roundKey = "roundOf16";
      break;
    case 8:
      roundKey = "quarterFinals";
      break;
    case 4:
      roundKey = "semiFinals";
      break;
    default:
      roundKey = "roundOf16";
      break;
  }

  const roundName = roundNameMap[roundKey];

  // 1. Categorize qualifiers by their group position
  const positionGroups: Record<number, Qualifier[]> = {};

  // Initialize position groups
  for (let i = 1; i <= qualifiersPerGroup; i++) {
    positionGroups[i] = [];
  }

  // Sort qualifiers into position groups
  qualifiers.forEach((team) => {
    if (team.position <= qualifiersPerGroup) {
      if (!positionGroups[team.position]) {
        positionGroups[team.position] = [];
      }
      positionGroups[team.position].push(team);
    }
  });

  // 2. Sort each position group by performance (pts > GD > GF)
  const sortTeams = (teams: Qualifier[]) =>
    [...teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  // Sort all position groups
  for (const position in positionGroups) {
    positionGroups[position] = sortTeams(positionGroups[position]);
  }

  // 3. Create position pairs based on qualifiers per group
  const positionPairs: [number, number][] = [];
  const positions = Object.keys(positionGroups).map(Number).sort();

  // Create pairs from highest to lowest positions
  for (let i = 0; i < positions.length / 2; i++) {
    const highPosition = positions[i];
    const lowPosition = positions[positions.length - 1 - i];
    positionPairs.push([highPosition, lowPosition]);
  }

  const matches: KnockoutMatch[] = [];

  // 4. Generate matches using position pairs
  positionPairs.forEach(([highPos, lowPos]) => {
    const highGroup = [...positionGroups[highPos]];
    const lowGroup = [...positionGroups[lowPos]];

    while (highGroup.length > 0 && lowGroup.length > 0) {
      const homeTeam = highGroup.shift()!;
      let awayTeam: Qualifier | null = null;

      // Try to find opponent from different group
      const differentGroupIndex = lowGroup.findIndex(
        (t) => t.group !== homeTeam.group
      );

      if (differentGroupIndex >= 0) {
        awayTeam = lowGroup.splice(differentGroupIndex, 1)[0];
      } else if (lowGroup.length > 0) {
        // Fallback to same group if necessary
        awayTeam = lowGroup.shift()!;
      }

      if (homeTeam && awayTeam) {
        matches.push({
          id: `${roundName.toLowerCase().replaceAll(" ", "-")}-${
            matches.length + 1
          }`,
          round: roundName,
          home: homeTeam.player,
          away: awayTeam.player,
          homeScore: null,
          awayScore: null,
          completed: false,
        });
      }
    }
  });

  return matches;
};

// Helper function to check power of two
const isPowerOfTwo = (n: number): boolean => {
  return n > 0 && (n & (n - 1)) === 0;
};
//   const roundName = "Round of 16";

//   // Categorize qualifiers by their group position
//   const groupPositions: Record<string, Qualifier[]> = {
//     first: [], // Group winners (1st place)
//     second: [], // Runners-up (2nd place)
//     third: [], // 3rd place
//     fourth: [], // 4th place
//   };

//   // Sort teams into their group positions
//   qualifiers.forEach((team) => {
//     if (team.position === 1) groupPositions.first.push(team);
//     else if (team.position === 2) groupPositions.second.push(team);
//     else if (team.position === 3) groupPositions.third.push(team);
//     else if (team.position === 4) groupPositions.fourth.push(team);
//   });

//   // Sort each category by performance (pts > GD > GF)
//   const sortTeams = (teams: Qualifier[]) =>
//     [...teams].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

//   const firstPlace = sortTeams(groupPositions.first);
//   const secondPlace = sortTeams(groupPositions.second);
//   const thirdPlace = sortTeams(groupPositions.third);
//   const fourthPlace = sortTeams(groupPositions.fourth);

//   const matches: KnockoutMatch[] = [];

//   // Pair 1st place teams with 4th place teams from different groups
//   for (let i = 0; i < firstPlace.length; i++) {
//     const homeTeam = firstPlace[i];
//     let awayTeam = fourthPlace.find((team) => team.group !== homeTeam.group);

//     // If no available 4th place team from another group, take any
//     if (!awayTeam && fourthPlace.length > 0) {
//       awayTeam = fourthPlace[0];
//     }

//     if (homeTeam && awayTeam) {
//       matches.push({
//         id: `${roundName.toLowerCase().replaceAll(" ", "-")}-${
//           matches.length + 1
//         }`,
//         round: roundName,
//         home: homeTeam.player,
//         away: awayTeam.player,
//         homeScore: null,
//         awayScore: null,
//         completed: false,
//       });

//       // Remove the used 4th place team
//       fourthPlace.splice(fourthPlace.indexOf(awayTeam), 1);
//     }
//   }

//   // Pair 2nd place teams with 3rd place teams from different groups
//   for (let i = 0; i < secondPlace.length; i++) {
//     const homeTeam = secondPlace[i];
//     let awayTeam = thirdPlace.find((team) => team.group !== homeTeam.group);

//     // If no available 3rd place team from another group, take any
//     if (!awayTeam && thirdPlace.length > 0) {
//       awayTeam = thirdPlace[0];
//     }

//     if (homeTeam && awayTeam) {
//       matches.push({
//         id: `${roundName.toLowerCase().replaceAll(" ", "-")}-${
//           matches.length + 1
//         }`,
//         round: roundName,
//         home: homeTeam.player,
//         away: awayTeam.player,
//         homeScore: null,
//         awayScore: null,
//         completed: false,
//       });

//       // Remove the used 3rd place team
//       thirdPlace.splice(thirdPlace.indexOf(awayTeam), 1);
//     }
//   }

//   return matches;
// };

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

/**
 * Updates a match score in localStorage by match ID
 * @param matchId - ID of the match to update (e.g. "round-of-16-1")
 * @param homeScore - Array of home scores [firstLeg, secondLeg] or single score
 * @param awayScore - Array of away scores [firstLeg, secondLeg] or single score
 */
export const updateMatchInStorage = ({
  matchId,
  roundKey,
  slug,
  firstLeg,
  secondLeg,
}: {
  matchId: string;
  roundKey: RoundsType;
  slug: string;
  firstLeg?: number | number[];
  secondLeg?: number | number[];
}) => {
  try {
    // 1. Get current tournament data
    const tournamentData: TournamentDataType = getTournamentData(slug);
    if (!tournamentData) throw new Error("No tournament data found");

    const knockoutStages = "knockoutStages";

    // 2. Validate round exists
    const round = tournamentData[knockoutStages][roundKey];
    if (!round) {
      throw new Error(`Round ${roundKey} not found in tournament data`);
    }

    // 3. Find the match to update
    const matchToUpdate = round.find(
      (match: KnockoutMatch) => match.id === matchId
    );
    if (!matchToUpdate) {
      throw new Error(`Match ${matchId} not found in round ${roundKey}`);
    }

    // 4. Normalize scores to arrays
    const normalizedFirstLegScore = Array.isArray(firstLeg)
      ? firstLeg
      : [null, null];
    const normalizedSecondLegScore = Array.isArray(secondLeg)
      ? secondLeg
      : [null, null];

    // 5.1 If it's a first leg match, we only update the first leg score
    if (firstLeg) {
      const homeScore = [normalizedFirstLegScore[0], null];
      const awayScore = [normalizedFirstLegScore[1], null];

      const updatedRounds = {
        ...tournamentData,
        [knockoutStages]: {
          ...tournamentData.knockoutStages,
          [roundKey]: round.map((match: KnockoutMatch) => {
            if (match.id === matchId) {
              return {
                ...match,
                homeScore: homeScore,
                awayScore: awayScore,
                updatedAt: new Date().toISOString(),
              };
            }
            return match;
          }),
        },
      };

      localStorage.setItem(
        `tourney-master-${slug}`,
        JSON.stringify(updatedRounds)
      );

      return updatedRounds;
    }

    // 5.2 If it's a two-legged match, we update both legs
    if (secondLeg) {
      const homeScore = [
        matchToUpdate.homeScore?.[0],
        normalizedSecondLegScore[0],
      ];
      const awayScore = [
        matchToUpdate.awayScore?.[0] ?? null,
        normalizedSecondLegScore[1],
      ];

      // 6. Determine winner
      const sanitizedHomeScore = homeScore.map((s) => s ?? 0);
      const sanitizedAwayScore = awayScore.map((s) => s ?? 0);
      const winner = determineWinner(
        sanitizedHomeScore,
        sanitizedAwayScore,
        matchToUpdate
      );

      // 7. Update the match
      const updatedRounds = {
        ...tournamentData,
        status:
          roundKey === "finals" && winner !== "draw"
            ? "completed"
            : tournamentData.status,
        [knockoutStages]: {
          ...tournamentData.knockoutStages,
          [roundKey]: round.map((match: KnockoutMatch) => {
            if (match.id === matchId) {
              return {
                ...match,
                homeScore: homeScore,
                awayScore: awayScore,
                winner,
                completed: true,
                updatedAt: new Date().toISOString(),
              };
            }
            return match;
          }),
        },
      };

      if (roundKey === "finals" && winner !== "draw") {
        localStorage.setItem(
          `tourney-master-${slug}`,
          JSON.stringify(updatedRounds)
        );
        return updatedRounds;
      }

      // . Advance to next round if applicable
      if (roundKey !== "finals" && winner !== "draw") {
        const nextRoundKey = getNextRoundKey(roundKey);

        if (nextRoundKey) {
          const isDrawn = drawNextKnockoutRound(
            updatedRounds,
            nextRoundKey,
            winner,
            matchId,
            slug
          );

          if (isDrawn) {
            return isDrawn;
          }
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to update match: ${error}`);
  }
};

const determineWinner = (
  homeScore: number[],
  awayScore: number[],
  matchToUpdate: KnockoutMatch
): string => {
  // For two-legged ties
  const isHomeScoreComplete = homeScore.every((score) => score !== null);
  const isAwayScoreComplete = awayScore.every((score) => score !== null);

  if (isAwayScoreComplete && isHomeScoreComplete) {
    const homeAggregate = homeScore.reduce((a: number, b) => a + b, 0);
    const awayAggregate = awayScore.reduce((a: number, b) => a + b, 0);

    if (homeAggregate > awayAggregate) return matchToUpdate.home as string;
    if (awayAggregate > homeAggregate) return matchToUpdate.away as string;

    // If still tied (could add penalty shootout logic here)
    return "draw";
  }

  // For single matches
  if (homeScore[0] > awayScore[0]) return matchToUpdate.home as string;
  if (awayScore[0] > homeScore[0]) return matchToUpdate.away as string;
  return "draw";
};

const drawNextKnockoutRound = (
  tournamentData: TournamentDataType,
  nextRound: RoundsType,
  winner: string,
  matchId: string,
  slug: string
): TournamentDataType => {
  // 1. Get the target round
  const round = tournamentData.knockoutStages[nextRound];
  if (!round) {
    throw new Error(`Round ${nextRound} not found in tournament data`);
  }

  // 2. Determine the exact slot in the bracket
  const sourceMatchNumber = parseInt(matchId.split("-").pop() || "0", 10);
  const targetMatchNumber = Math.ceil(sourceMatchNumber / 2);
  const isHomeInNextRound = sourceMatchNumber % 2 === 1; // Odd numbers go to home, even to away

  // 3. Find or create the target match
  const targetMatch = round.find((match) => {
    const matchNum = parseInt(match.id.split("-").pop() || "0", 10);
    return matchNum === targetMatchNumber;
  });

  // 4. Prepare updated round data
  const updatedRound = [...round];

  if (targetMatch) {
    // Update existing match
    const matchIndex = updatedRound.findIndex((m) => m.id === targetMatch.id);
    updatedRound[matchIndex] = {
      ...targetMatch,
      [isHomeInNextRound ? "home" : "away"]: winner,
    };
  } else {
    // Create new match with proper bracket position
    const roundName = roundNameMap[nextRound];
    const newMatchId = `${roundName.replaceAll(" ", "-")}-${targetMatchNumber}`;

    updatedRound.push({
      id: newMatchId,
      round: roundName,
      home: isHomeInNextRound ? winner : null,
      away: isHomeInNextRound ? null : winner,
      homeScore: null,
      awayScore: null,
      completed: false,
    });

    // Sort matches by their number to maintain bracket order
    updatedRound.sort((a, b) => {
      const aNum = parseInt(a.id.split("-").pop() || "0", 10);
      const bNum = parseInt(b.id.split("-").pop() || "0", 10);
      return aNum - bNum;
    });
  }

  // 5. Update tournament data
  const updatedTournamentData: TournamentDataType = {
    ...tournamentData,
    knockoutStages: {
      ...tournamentData.knockoutStages,
      [nextRound]: updatedRound,
    },
  };

  // 6. Save to localStorage
  localStorage.setItem(
    `tourney-master-${slug}`,
    JSON.stringify(updatedTournamentData)
  );

  return updatedTournamentData;
};

const getNextRoundKey = (currentRound: string): RoundsType | null => {
  const roundOrder = [
    "roundOf32",
    "roundOf16",
    "quarterFinals",
    "semiFinals",
    "finals",
  ];
  const currentIndex = roundOrder.indexOf(currentRound);
  return currentIndex < roundOrder.length - 1
    ? (roundOrder[currentIndex + 1] as RoundsType)
    : null;
};

export const roundNameMap: Record<string, string> = {
  roundOf32: "Round of 32",
  roundOf16: "Round of 16",
  quarterFinals: "Quarter Finals",
  semiFinals: "Semi Finals",
  finals: "Finals",
};

export const reverseRoundNameMap = Object.fromEntries(
  Object.entries(roundNameMap).map(([key, value]) => [value, key])
);

export const updateGroupStandingsTeamName = (
  groupId: string,
  slug: string,
  initialGroups: groupType,
  editedNames: EditNamesType
) => {
  const tournaments: TournamentDataType = getTournamentData(slug);
  if (!tournaments) {
    toast.error("Tournament data not found");
    return;
  }

  const updatedGroupStanding = tournaments.groupStandings[groupId].map(
    (team, playerIdx) => {
      const player =
        team.player !== initialGroups[groupId][playerIdx]
          ? initialGroups[groupId][playerIdx]
          : team.player;

      const matches = team.matches.map((match) => {
        const findMatch = Object.values(editedNames[groupId]).filter(
          (name) =>
            name.oldName.replaceAll(",", "") ===
            match.opponent.replaceAll(",", "")
        );

        if (findMatch.length === 0) return match;

        return {
          ...match,
          opponent:
            findMatch.length > 0 ? findMatch[0].newName : match.opponent,
        };
      });

      return {
        ...team,
        player,
        matches,
      };
    }
  );

  return updatedGroupStanding;
};

export const updateGroupFixturesTeamName = (
  groupId: string,
  slug: string,
  editedNames: EditNamesType
) => {
  const tournaments = getTournamentData(slug);
  if (!tournaments) {
    toast.error("Tournament data not found");
    return;
  }

  const updatedFixtures = tournaments.groupFixtures[groupId]?.map(
    (fixture: MatchFixture) => {
      const findFixture = fixture.players.map((player) => {
        const editedName = Object.values(editedNames[groupId]).find((name) => {
          return (
            name.oldName.replaceAll(",", "") === player.replaceAll(",", "")
          );
        });
        return editedName ? editedName.newName : player;
      });

      if (!findFixture) return fixture;
      return {
        ...fixture,
        players: findFixture,
      };
    }
  );

  return updatedFixtures;
};

export const getAndSortTournaments = (prefix: string): TournamentDataType[] => {
  const tournaments = getItemsStartingWith<TournamentDataType>(prefix);
  const values = Object.values(tournaments);
  const sortData = sortByDate(values, "createdAt");

  return sortData;
};

export const drawKnockoutBracket = (players: string[]) => {
  const isPowerOfTwo = (n: number): boolean => {
    return n > 0 && (n & (n - 1)) === 0;
  };

  if (!isPowerOfTwo(players.length)) {
    toast.error("Number of players must be a power of 2 (e.g., 2, 4, 8, 16)");
    return null;
  }

  // Helper function to shuffle array (optional)
  const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Create matches for each round
  const createMatches = (
    participants: string[],
    roundName: string
  ): KnockoutMatch[] => {
    const matches: KnockoutMatch[] = [];
    for (let i = 0; i < participants.length; i += 2) {
      matches.push({
        id: `${roundName}-${i / 2 + 1}`,
        round: roundName,
        home: participants[i],
        away: participants[i + 1],
        homeScore: null,
        awayScore: null,
        completed: false,
      });
    }
    return matches;
  };

  // Shuffle players for random pairing (optional)
  const shuffledPlayers = shuffleArray(players);

  // Determine the knockout structure based on number of players
  const knockoutStages: {
    roundOf32?: KnockoutMatch[];
    roundOf16?: KnockoutMatch[];
    quarterFinals?: KnockoutMatch[];
    semiFinals?: KnockoutMatch[];
    finals?: KnockoutMatch[];
  } = {};

  switch (players.length) {
    case 2:
      knockoutStages.finals = createMatches(shuffledPlayers, "Finals");
      break;
    case 4:
      knockoutStages.semiFinals = createMatches(shuffledPlayers, "Semi-Finals");
      break;
    case 8:
      knockoutStages.quarterFinals = createMatches(
        shuffledPlayers,
        "Quarter-Finals"
      );
      break;
    case 16:
      knockoutStages.roundOf16 = createMatches(shuffledPlayers, "round-of-16");
      break;
    case 32:
      knockoutStages.roundOf32 = createMatches(shuffledPlayers, "round-of-32");
      break;
    default:
      // For other power-of-two numbers (unlikely in most tournaments)
      const roundNames = [
        "Finals",
        "Semi Finals",
        "Quarter Finals",
        "Round of 16",
        "Round of 32",
        "Round of 64",
      ];
      let roundIndex = Math.log2(players.length) - 1;
      const roundName = roundNames[roundIndex] || `Round of ${players.length}`;
      (knockoutStages as Record<string, KnockoutMatch[]>)[
        `roundOf${players.length}`
      ] = createMatches(shuffledPlayers, roundName);
  }

  return {
    ...knockoutStages,
    knockoutDrawn: true,
  };
};
