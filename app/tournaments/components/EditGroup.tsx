"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  EditNamesType,
  groupType,
  TournamentDataType,
} from "@/types/tournament.type";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getTournamentData,
  updateGroupFixturesTeamName,
  updateGroupStandingsTeamName,
} from "@/lib/utils";
import { useTournaments } from "@/context/Tournament.context";

interface EditGroupProps {
  groups: groupType;
  slug: string;
  setActiveTournament: React.Dispatch<
    React.SetStateAction<TournamentDataType | null>
  >;
}

const EditGroup = ({ groups, slug, setActiveTournament }: EditGroupProps) => {
  const [initialGroups, setInitialGroups] = React.useState<groupType>(groups);
  const [editedGroup, setEditedGroup] = React.useState<string[]>([]);
  const [editedNames, setEditedNames] = React.useState<EditNamesType>({});
  const { setTournaments, setOriginalTournamentList } = useTournaments();

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

    setEditedNames((prev) => ({
      ...prev,
      [groupId]: {
        ...(prev[groupId] || {}),
        [playerIdx]: { oldName: groups[groupId][playerIdx], newName: newName },
      },
    }));
    setInitialGroups(updatedGroups);
  };

  const saveChanges = (groupId: string) => {
    const tournaments = getTournamentData(slug);
    if (!tournaments) {
      toast.error("Tournament data not found");
      return;
    }

    const updatedGroupStandings = updateGroupStandingsTeamName(
      groupId,
      slug,
      initialGroups,
      editedNames
    );

    const updatedGroupFixtures = updateGroupFixturesTeamName(
      groupId,
      slug,
      editedNames
    );

    const updatedData = {
      ...tournaments,
      groups: {
        ...tournaments.groups,
        [groupId]: initialGroups[groupId],
      },
      groupStandings: {
        ...tournaments.groupStandings,
        [groupId]: updatedGroupStandings,
      },
      groupFixtures: {
        ...tournaments.groupFixtures,
        [groupId]: updatedGroupFixtures,
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`tourney-master-${slug}`, JSON.stringify(updatedData));
    setActiveTournament(updatedData);
    setTournaments((prev) =>
      prev.map((tournament) =>
        tournament.slug === slug ? updatedData : tournament
      )
    );
    setOriginalTournamentList((prev) =>
      prev.map((tournament) =>
        tournament.slug === slug ? updatedData : tournament
      )
    );
    toast.success("Changes saved successfully!");
  };

  React.useEffect(() => {
    const editedGroupIds = Object.keys(initialGroups).filter((groupId) =>
      initialGroups[groupId].some(
        (player, idx) => player !== groups[groupId][idx]
      )
    );

    setEditedGroup(editedGroupIds);
  }, [initialGroups, groups]);

  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      {Object.entries(initialGroups).map(([groupName, groupData]) => {
        return (
          <div key={groupName} className="flex flex-col gap-y-2">
            <div className="flex items-center">
              <h3 className="text-lg text-gray-200 font-semibold capitalize">
                {groupName}
              </h3>

              {editedGroup.includes(groupName) && (
                <Button
                  variant={"ghost"}
                  onClick={() => saveChanges(groupName)}
                >
                  <span className="text-sm text-emerald-400">Save Changes</span>
                </Button>
              )}
            </div>

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
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default EditGroup;
