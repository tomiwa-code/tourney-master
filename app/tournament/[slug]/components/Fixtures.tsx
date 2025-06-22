"use client";
import React from "react";

import { Input } from "@/components/ui/input";
import { cn, getTournamentData, updateMatchScore } from "@/lib/utils";
import { MatchFixture } from "@/types/tournament.type";
import { toast } from "sonner";

const Fixtures = ({
  group,
  teams,
  slug,
}: {
  group: string;
  teams: MatchFixture[];
  slug: string;
}) => {
  const [matchResults, setMatchResults] = React.useState<{
    [key: string]: {
      homeScore: number | null;
      awayScore: number | null;
      groupName: string;
      matchIndex: number;
    };
  }>({});
  const [isEditing, setIsEditing] = React.useState<string[]>([]);

  const handleScoreChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    groupName: string,
    matchIndex: number,
    isHome: boolean
  ) => {
    const { value } = e.target;
    const score = value === "" ? null : Math.max(0, parseInt(value, 10));

    setIsEditing((prev) => [...prev, `${groupName}-${matchIndex}`]);

    setMatchResults((prev) => ({
      ...prev,
      [`${groupName}-${matchIndex}`]: {
        homeScore: isHome
          ? score
          : prev[`${groupName}-${matchIndex}`]
          ? prev[`${groupName}-${matchIndex}`].homeScore
          : null,
        awayScore: !isHome
          ? score
          : prev[`${groupName}-${matchIndex}`]
          ? prev[`${groupName}-${matchIndex}`].awayScore
          : null,
        groupName,
        matchIndex,
      },
    }));
  };

  const handleScoreSubmit = (
    groupName: string,
    matchIndex: number,
    scores: [number, number]
  ) => {
    const currentTournament = getTournamentData(slug);
    if (!currentTournament) return;

    const updatedTournament = updateMatchScore(
      currentTournament,
      groupName,
      matchIndex,
      scores[0],
      scores[1]
    );

    localStorage.setItem(
      `tourney-master-${slug}`,
      JSON.stringify(updatedTournament)
    );

    toast.success("Match results saved!");
  };

  React.useEffect(() => {
    const initialResults = teams.reduce(
      (acc, team, idx) => {
        acc[`${group}-${idx}`] = {
          homeScore: team.result.homeScore,
          awayScore: team.result.awayScore,
          groupName: group,
          matchIndex: idx,
        };
        return acc;
      },
      {} as {
        [key: string]: {
          homeScore: number | null;
          awayScore: number | null;
          groupName: string;
          matchIndex: number;
        };
      }
    );

    setMatchResults(initialResults);
  }, [group, teams]);

  //   Loop through the match results and check for any games from any group that has both home and away scores set and it's id exists inside isEditing, submit such score and remove the id from isEditing
  React.useEffect(() => {
    Object.entries(matchResults).forEach(([key, result]) => {
      if (
        result.homeScore !== null &&
        result.awayScore !== null &&
        isEditing.includes(key)
      ) {
        const [groupName, matchIndex] = key.split("-");
        handleScoreSubmit(groupName, parseInt(matchIndex, 10), [
          result.homeScore,
          result.awayScore,
        ]);
        setIsEditing((prev) => prev.filter((id) => id !== key));
      }
    });
  }, [matchResults, isEditing, handleScoreSubmit]);

  return (
    <div className="flex flex-col gap-y-5" key={group}>
      <h2 className="uppercase text-xl font-semibold text-white">
        group {group}
      </h2>

      <div className="flex-col flex items-center gap-y-2">
        {teams.map((team, idx) => (
          <div key={`${group}-${idx}`} className="flex items-center gap-x-4">
            <FixtureCard
              groupName={group}
              matchIndex={idx}
              isHome
              team={team.players[0]}
              score={matchResults[`${group}-${idx}`]?.homeScore ?? null}
              onScoreChange={handleScoreChange}
            />

            <div className="w-9 h-full bg-white flex items-center justify-center">
              <p className="text-dark font-extrabold uppercase text-base leading-[16px]">
                vs
              </p>
            </div>

            <FixtureCard
              team={team.players[1]}
              score={matchResults[`${group}-${idx}`]?.awayScore ?? null}
              className="flex-row-reverse"
              groupName={group}
              matchIndex={idx}
              onScoreChange={handleScoreChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fixtures;

const FixtureCard = ({
  team,
  score,
  className,
  onScoreChange,
  isHome = false,
  groupName,
  matchIndex,
}: {
  groupName: string;
  matchIndex: number;
  team: string;
  score: number | null;
  isHome?: boolean;
  className?: string;
  onScoreChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    groupName: string,
    matchIndex: number,
    isHome: boolean
  ) => void;
}) => {
  return (
    <div className={cn("flex items-center gap-x-2", className)}>
      <div className="min-w-[180px] h-8 flex items-center justify-center bg-white">
        <p className="text-dark font-extrabold text-sm">{team}</p>
      </div>

      <Input
        type="number"
        className="text-red font-extrabold text-center focus:bg-white border-0 outline-0 ring-0 focus:outline-0 !text-2xl px-0 rounded-none w-10 h-8 flex items-center justify-center bg-primary"
        value={score !== null ? score : ""}
        onChange={(e) => onScoreChange(e, groupName, matchIndex, isHome)}
      />
    </div>
  );
};
