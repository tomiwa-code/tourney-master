"use client";
import React from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  groupType,
  MatchFixture,
  PlayerStats,
  TournamentDataType,
} from "@/types/tournament.type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { getTournamentData } from "@/lib/utils";

interface EditTournamentModalProps {
  tournamentData: TournamentDataType;
  onClose: () => void;
  setTournaments: React.Dispatch<React.SetStateAction<TournamentDataType[]>>;
  setActiveTournament: React.Dispatch<
    React.SetStateAction<TournamentDataType | null>
  >;
}

const EditTournamentModal = ({
  tournamentData,
  onClose,
  setActiveTournament,
  setTournaments,
}: EditTournamentModalProps) => {
  const {
    slug,
    name,
    distribution,
    status,
    groups,
    playersPerGroup,
    totalPlayer,
    numOfQualifier,
  } = tournamentData;

  const [initialGroups, setInitialGroups] = React.useState<groupType>(groups);

  const handleChangeTeamName = (
    groupId: string,
    playerIdx: number,
    newName: string
  ) => {
    const updatedGroup = initialGroups[groupId].map((player, idx) =>
      idx === playerIdx ? newName : player
    );
    const updatedGroups = {
      ...initialGroups,
      [groupId]: updatedGroup,
    };
    setInitialGroups(updatedGroups);
  };

  const resetPlayerName = (groupId: string, playerIdx: number) => {
    const originalName = groups[groupId][playerIdx];
    const updatedGroup = initialGroups[groupId].map((player, idx) =>
      idx === playerIdx ? originalName : player
    );
    const updatedGroups = {
      ...initialGroups,
      [groupId]: updatedGroup,
    };
    setInitialGroups(updatedGroups);
    toast.success(`Player name reset to ${originalName}`);
  };

  const saveChanges = (groupId: string, playerIdx: number) => {
    // Get current tournament data
    const tournaments = getTournamentData(slug);
    if (!tournaments) {
      toast.error("Tournament data not found");
      return;
    }

    // Get the new player name
    const newName = initialGroups[groupId][playerIdx];

    // 1. Update the groups data
    const updatedGroupsData = {
      ...tournaments.groups,
      [groupId]: tournaments.groups[groupId].map(
        (player: PlayerStats, idx: number) =>
          idx === playerIdx ? newName : player
      ),
    };

    // 2. Update group standings (if they exist)
    let updatedStandings = tournaments.groupStandings;
    if (tournaments.groupStandings && tournaments.groupStandings[groupId]) {
      updatedStandings = {
        ...tournaments.groupStandings,
        [groupId]: tournaments.groupStandings[groupId].map(
          (player: PlayerStats) => {
            if (player.player === groups[groupId][playerIdx]) {
              return {
                ...player,
                player: newName,
                // Update opponent names in matches if needed
                matches: player.matches?.map((match) => ({
                  ...match,
                  opponent:
                    match.opponent === groups[groupId][playerIdx]
                      ? newName
                      : match.opponent,
                })),
              };
            }
            return player;
          }
        ),
      };
    }

    // 3. Update group fixtures (if they exist)
    let updatedFixtures = tournaments.groupFixtures;
    if (tournaments.groupFixtures && tournaments.groupFixtures[groupId]) {
      updatedFixtures = {
        ...tournaments.groupFixtures,
        [groupId]: tournaments.groupFixtures[groupId].map(
          (fixture: MatchFixture) => ({
            ...fixture,
            players: fixture.players.map((player) =>
              player === groups[groupId][playerIdx] ? newName : player
            ),
          })
        ),
      };
    }

    // Create the fully updated tournament
    const updatedTournament = {
      ...tournaments,
      groups: updatedGroupsData,
      groupStandings: updatedStandings,
      groupFixtures: updatedFixtures,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem(
      `tourney-master-${slug}`,
      JSON.stringify(updatedTournament)
    );

    // Update state
    setActiveTournament(updatedTournament);
    setTournaments((prev) =>
      prev.map((tournament) =>
        tournament.slug === slug ? updatedTournament : tournament
      )
    );

    toast.success("Player name updated successfully!");
  };

  //   const saveChanges = (groupId: string, playerIdx: number) => {
  //     const tournaments = getTournamentData(slug);
  //     if (!tournaments) {
  //       toast.error("Tournament data not found");
  //       return;
  //     }

  //     const updatedGroup = initialGroups[groupId].map((player, idx) =>
  //       idx !== playerIdx ? player : initialGroups[groupId][playerIdx]
  //     );

  //     // update the group standing
  //     const standings = tournaments.groupStandings[groupId].map(
  //       (player: PlayerStats, idx: number) => {
  //         if (idx === playerIdx) {
  //           return { ...player, name: updatedGroup[playerIdx] };
  //         }
  //         return player;
  //       }
  //     );

  //     console.log("updatedGroup:", updatedGroup);

  //     console.log("Current Group Standings:", standings);

  //     // .map(
  //     //   (player, idx) =>
  //     //     idx === playerIdx ? { ...player, name: newName } : player
  //     // );

  //     const updatedGroupStandings = {
  //       ...tournaments.groupStandings,
  //       [groupId]: {
  //         ...tournaments.groupStandings[groupId],
  //         players: updatedGroup,
  //       },
  //     };

  //     // console.log("Updated Group Standings:", updatedGroupStandings);

  //     const updatedGroups = {
  //       ...tournaments,
  //       groups: {
  //         ...tournaments.groups,
  //         [groupId]: updatedGroup,
  //       },
  //     };

  //     // Save to localStorage
  //     // localStorage.setItem(
  //     //   `tourney-master-${slug}`,
  //     //   JSON.stringify(updatedGroups)
  //     // );
  //     // onClose();
  //     // setActiveTournament(null);
  //     // setTournaments((prev) =>
  //     //   prev.map((tournament) =>
  //     //     tournament.slug === slug ? updatedGroups : tournament
  //     //   )
  //     // );
  //     toast.success("Player names updated successfully!");
  //   };

  return (
    <DialogContent className="w-full mx-auto !max-w-2xl bg-dark-300 outline-0 border-0 h-[95vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="capitalize text-white">
          Editing {name}
        </DialogTitle>
        <DialogDescription className="text-gray-300 capitalize grid grid-cols-3 gap-4 mt-2">
          <span>
            id: <span className="font-semibold">{slug.split("-")[1]}</span>
          </span>

          <span>
            name: <span className="font-semibold">{name}</span>
          </span>
          <span>
            distribution: <span className="font-semibold">{distribution}</span>
          </span>
          <span>
            status: <span className="font-semibold">{status}</span>
          </span>
          <span>
            groups:{" "}
            <span className="font-semibold">
              {Object.values(groups).length}
            </span>
          </span>
          <span>
            players per group:{" "}
            <span className="font-semibold">{playersPerGroup}</span>
          </span>
          <span>
            total players: <span className="font-semibold">{totalPlayer}</span>
          </span>
          <span>
            qualifiers: <span className="font-semibold">{numOfQualifier}</span>
          </span>
        </DialogDescription>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {Object.entries(initialGroups).map(([groupName, groupData]) => {
            return (
              <div key={groupName} className="flex flex-col gap-y-2">
                <h3 className="text-lg text-gray-200 font-semibold capitalize">
                  {groupName}
                </h3>

                {groupData.map((player, idx) => (
                  <div className="flex items-center" key={idx}>
                    <Input
                      value={player}
                      onChange={(e) =>
                        handleChangeTeamName(groupName, idx, e.target.value)
                      }
                      autoFocus={false}
                      className="border-gray-500 text-white"
                    />

                    {groups[groupName][idx] !== player && (
                      <div className="flex items-center">
                        <Button
                          size={"icon"}
                          variant={"ghost"}
                          onClick={() => resetPlayerName(groupName, idx)}
                        >
                          <X className="text-red" />
                        </Button>

                        <Button
                          size={"icon"}
                          variant={"ghost"}
                          onClick={() => saveChanges(groupName, idx)}
                        >
                          <Check className="text-emerald-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </DialogHeader>
      <DialogFooter>
        <Button
          onClick={onClose}
          className="capitalize bg-white h-12 w-28 hover:bg-dark-400 duration-300 hover:text-white font-medium"
        >
          close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditTournamentModal;
