import { toast } from "sonner";

type CreateTournamentValidateInputType = {
  tournamentName: string;
  maxPlayers: string;
  playersPerGroup: string;
  playerNames: string;
};

export const createTournamentValidateInput = ({
  tournamentName,
  maxPlayers,
  playersPerGroup,
  playerNames,
}: CreateTournamentValidateInputType) => {
  if (!tournamentName.trim()) {
    toast.error("Tournament name is required");
    return false;
  }

  if (!maxPlayers || Number(maxPlayers) < 2) {
    toast.error("Max players must be at least 2");
    return false;
  }

  if (!playersPerGroup || Number(playersPerGroup) < 2) {
    toast.error("Players per group must be at least 2");
    return false;
  }

  if (Number(playersPerGroup) > Number(maxPlayers)) {
    toast.error("Players per group cannot exceed max players");
    return false;
  }

  if (!playerNames.trim()) {
    toast.error("Player names are required");
    return false;
  }

  return true;
};

export const validatePlayerNames = (
  playerNames: string[],
  maxPlayers: number,
  isCustomInput: boolean = false
) => {
  if (playerNames.length < 2) {
    toast.error("At least two player names are required");
    return false;
  }

  if (isCustomInput) {
    const newNames = playerNames.filter((name) => name !== "*");
    if (newNames.length > Number(maxPlayers)) {
      toast.error(
        `Number of player names cannot exceed max players (${maxPlayers}) and you have provided ${playerNames.length} names.`
      );
      return false;
    }

    return true;
  }

  if (!isCustomInput && playerNames.length > Number(maxPlayers)) {
    toast.error(
      `Number of player names cannot exceed max players (${maxPlayers}) and you have provided ${playerNames.length} names.`
    );
    return false;
  }

  if (!isCustomInput && maxPlayers && playerNames.length < Number(maxPlayers)) {
    toast.error(
      `You have provided ${playerNames.length} player names, but the max players is set to ${maxPlayers}. Please add more player names or adjust the max players.`,
      {
        duration: 8000,
      }
    );
    return false;
  }

  return true;
};
