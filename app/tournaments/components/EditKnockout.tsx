"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnockoutMatch, TournamentDataType } from "@/types/tournament.type";
import { toast } from "sonner";
import { getTournamentData } from "@/lib/utils";
import { useTournaments } from "@/context/Tournament.context";

interface EditKnockoutProps {
  tournamentData: TournamentDataType;
  onClose: () => void;
}

const EditKnockout = ({ tournamentData, onClose }: EditKnockoutProps) => {
  const [groupId, setGroupId] = React.useState<string>("");
  const [isEdited, setIsEdited] = React.useState<boolean>(false);
  const [knockoutMatches, setKnockoutMatches] = React.useState<KnockoutMatch[]>(
    []
  );
  const { setTournaments, setOriginalTournamentList } = useTournaments();

  const { knockoutStages, slug } = tournamentData;

  const knockoutFirstStage = React.useMemo((): KnockoutMatch[] => {
    if (!knockoutStages) return [];

    if (knockoutStages?.roundOf32 && knockoutStages.roundOf32.length > 0) {
      setGroupId("roundOf32");
      return knockoutStages.roundOf32;
    }
    if (knockoutStages?.roundOf16 && knockoutStages.roundOf16.length > 0) {
      setGroupId("roundOf16");
      return knockoutStages.roundOf16;
    }
    if (
      knockoutStages?.quarterFinals &&
      knockoutStages.quarterFinals.length > 0
    ) {
      setGroupId("quarterFinals");
      return knockoutStages.quarterFinals;
    }
    return [];
  }, [knockoutStages]);

  const handleChangeMatchName = (
    matchIdx: number,
    newName: string,
    isHome: boolean
  ) => {
    setIsEdited(true);
    setKnockoutMatches((prev) =>
      prev.map((match, idx) =>
        idx === matchIdx
          ? { ...match, [isHome ? "home" : "away"]: newName }
          : match
      )
    );
  };

  const saveChanges = () => {
    const tournament: TournamentDataType = getTournamentData(slug);

    if (!tournament) {
      toast.error("Tournament data not found");
      return;
    }

    const updateKnockoutMatches = {
      ...tournament,
      knockoutStages: {
        ...tournament.knockoutStages,
        [groupId]: knockoutMatches,
      },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `tourney-master-${slug}`,
      JSON.stringify(updateKnockoutMatches)
    );
    setTournaments((prev) =>
      prev.map((tournament) =>
        tournament.slug === slug ? updateKnockoutMatches : tournament
      )
    );
    setOriginalTournamentList((prev) =>
      prev.map((tournament) =>
        tournament.slug === slug ? updateKnockoutMatches : tournament
      )
    );
    onClose();
    toast.success("Changes saved successfully!");
  };

  React.useEffect(() => {
    setKnockoutMatches(knockoutFirstStage);
  }, [knockoutFirstStage]);

  return (
    <div className="w-full flex flex-col gap-y-4 mt-10">
      {knockoutMatches.map((match, idx) => {
        const homeName = match.home || match.home || "";
        const awayName = match.away || match.away || "";

        return (
          <div key={idx} className="flex items-center gap-x-4">
            <Input
              value={homeName}
              autoFocus={false}
              className="border-gray-500 text-white"
              onChange={(e) => handleChangeMatchName(idx, e.target.value, true)}
            />

            <h2 className="uppercase text-gray-200 font-semibold">vs</h2>

            <Input
              value={awayName}
              autoFocus={false}
              className="border-gray-500 text-white"
              onChange={(e) =>
                handleChangeMatchName(idx, e.target.value, false)
              }
            />
          </div>
        );
      })}

      <div className="flex items-center justify-end mt-2">
        <Button
          disabled={!isEdited}
          className="bg-emerald-700 text-white px-4 py-2 hover:bg-emerald-600 duration-300"
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditKnockout;
