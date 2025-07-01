"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnockoutMatch, TournamentDataType } from "@/types/tournament.type";
import { toast } from "sonner";

interface EditKnockoutProps {
  tournamentData: TournamentDataType;
}

const EditKnockout = ({ tournamentData }: EditKnockoutProps) => {
  const [editedMatches, setEditedMatches] = React.useState<KnockoutMatch[]>([]);

  const { knockoutStages } = tournamentData;
  const knockoutArr =
    knockoutStages?.roundOf32?.length && knockoutStages.roundOf32.length > 1
      ? knockoutStages.roundOf32
      : knockoutStages?.roundOf16?.length && knockoutStages.roundOf16.length > 1
      ? knockoutStages.roundOf16
      : knockoutStages?.quarterFinals?.length &&
        knockoutStages.quarterFinals.length > 1
      ? knockoutStages.quarterFinals
      : knockoutStages?.semiFinals?.length &&
        knockoutStages.semiFinals.length > 1
      ? knockoutStages.semiFinals
      : knockoutStages?.finals?.length
      ? knockoutStages.finals
      : [];

  const handleChangeMatchName = (
    matchIdx: number,
    newName: string,
    isHome: boolean
  ) => {
    setEditedMatches((prev) =>
      prev.map((match, idx) =>
        idx === matchIdx
          ? { ...match, [isHome ? "home" : "away"]: newName }
          : match
      )
    );
  };

  const saveChanges = () => {
    if (editedMatches.length === 0) {
      toast.warning("No matches to update");
      return;
    }

    // Determine which stage we're editing
    let stageKey: keyof typeof knockoutStages = "quarterFinals";
    if (knockoutStages?.roundOf32?.length) stageKey = "roundOf32";
    else if (knockoutStages?.roundOf16?.length) stageKey = "roundOf16";
    else if (knockoutStages?.semiFinals?.length) stageKey = "semiFinals";
    else if (knockoutStages?.finals?.length) stageKey = "finals";

    // Create updated knockout stages
    const updatedKnockoutStages = {
      ...knockoutStages,
      [stageKey]: editedMatches.map((match, idx) => ({
        ...knockoutArr[idx], // Preserve other match properties
        home: match.home,
        away: match.away,
      })),
    };

    // Update the tournament data
    const updatedTournament = {
      ...tournamentData,
      knockoutStages: updatedKnockoutStages,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    // localStorage.setItem(
    //   `tourney-master-${slug}`,
    //   JSON.stringify(updatedTournament)
    // );

    // Update state
    // setTournamentData(updatedTournament);
    // toast.success("Knockout matches updated successfully!");
  };

  React.useEffect(() => {
    setEditedMatches(knockoutArr);
  }, [knockoutArr]);

  return (
    <div className="w-full flex flex-col gap-y-4 mt-10">
      {knockoutArr.map((match, idx) => {
        const homeName = editedMatches[idx]?.home || match.home || "";
        const awayName = editedMatches[idx]?.away || match.away || "";

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
        <Button className="bg-emerald-700 text-white px-4 py-2">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditKnockout;
